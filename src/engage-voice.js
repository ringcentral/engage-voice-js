import axios from 'axios'
import RingCentral from 'ringcentral-js-concise'

const version = process.env.version

class HTTPError extends Error {
  constructor (status, statusText, data, config) {
    super(`status: ${status}
statusText: ${statusText}
data: ${JSON.stringify(data, null, 2)}
config: ${JSON.stringify(config, null, 2)}`)
    this.status = status
    this.statusText = statusText
    this.data = data
    this.config = config
  }
}

class RingCentralEngageVoice extends RingCentral {
  constructor ({
    clientId,
    clientSecret,
    server = 'https://engage.ringcentral.com/voice',
    authServer = 'https://engage.ringcentral.com',
    rcServer = 'https://platform.ringcentral.com'
  }) {
    super(clientId, clientSecret, server)
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.server = server
    this.rcServer = rcServer
    this.authServer = authServer
    this.rc = new RingCentral(clientId, clientSecret, rcServer)
    this._axios = axios.create()
    const request = this._axios.request.bind(this._axios)
    this._axios.request = async config => { // try to refresh token if necessary
      try {
        return await request(config)
      } catch (e) {
        if (e.response) {
          throw new HTTPError(e.response.status, e.response.statusText, e.response.data, e.response.config)
        } else {
          throw e
        }
      }
    }
  }

  async authorize (...args) {
    await this.rc.authorize(...args)
    await this.getToken()
  }

  async getToken () {
    const url = this.authServer + '/api/auth/login/rc/accesstoken'
    const token = this.rc._token.access_token
    const body = 'rcAccessToken=' + token + '&rcTokenType=Bearer'
    const res = await this._axios.request({
      method: 'post',
      url,
      data: body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    this.token(res.data)
  }

  _patchHeaders (headers) {
    const userAgentHeader = `ringcentral-engage-voice-js/v${version}`
    return {
      ...this._bearerAuthorizationHeader(),
      'X-User-Agent': userAgentHeader,
      'RC-User-Agent': userAgentHeader,
      ...headers
    }
  }

  _bearerAuthorizationHeader () {
    let accessToken = ''
    if (this.user) {
      accessToken = this._token.accessToken
    }
    return { Authorization: `Bearer ${accessToken}` }
  }
}

export default RingCentralEngageVoice
