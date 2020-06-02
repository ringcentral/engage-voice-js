import axios from 'axios'
import RingCentral, { HTTPError } from './ringcentral'
import URI from 'urijs'

const version = process.env.version

const SERVER = 'https://engage.ringcentral.com'
const LEGACY_SERVERS = [
  'https://portal.vacd.biz',
  'https://portal.virtualacd.biz'
]
const RINGCENTRAL_SERVER = 'https://platform.ringcentral.com'

class RingCentralEngageVoice extends RingCentral {
  constructor ({
    clientId,
    clientSecret,
    server = SERVER,
    rcServer = RINGCENTRAL_SERVER,
    apiPrefix = 'voice'
  }) {
    super(clientId, clientSecret, server)
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.server = server
    this.rcServer = rcServer
    this.apiPrefix = apiPrefix
    this.isLegacy = this.isLegacyServer(server)
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

  isLegacyServer (server) {
    return RingCentralEngageVoice.LEGACY_SERVERS.includes(server)
  }

  request (config) {
    let uri = URI(config.url)
    if (uri.hostname() === '') {
      const { url = '' } = config
      const prefix = url.startsWith(this.apiPrefix) || url.startsWith('/' + this.apiPrefix)
        ? ''
        : this.apiPrefix
      const path = URI.joinPaths(prefix, url)
      uri = this.parseUrl(this.server, path)
    }
    return this._axios.request({
      ...config,
      url: uri.toString(),
      headers: this._patchHeaders(config.headers)
    })
  }

  async authorize (...args) {
    if (this.isLegacy) {
      await this.legacyAuthorize(...args)
    } else {
      await this.rc.authorize(...args)
      await this.getToken()
    }
  }

  async legacyAuthorize (...args) {
    await this.getLegacyToken(...args)
  }

  async getLegacyToken ({
    username,
    password
  }) {
    const url = this.server + '/api/v1/auth/login'
    const body = `username=${username}&password=${password}`
    const res = await this._axios.request({
      method: 'post',
      url,
      data: body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    const r = res.data
    const url1 = this.server + '/api/v1/admin/token'
    const res1 = await this._axios.request({
      method: 'post',
      url: url1,
      headers: {
        'X-Auth-Token': r.authToken || ''
      }
    })

    const r1 = res1.data
    this.token({
      ...r,
      apiToken: r1
    })
  }

  revokeLegacyToken () {
    if (this._token) {
      this.delete(`/api/v1/admin/token/${this._token.apiToken}
    X`)
    }
  }

  async getToken () {
    const url = this.server + '/api/auth/login/rc/accesstoken'
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
    const authHeaders = this.isLegacy
      ? this._legacyHeader()
      : this._bearerAuthorizationHeader()
    return {
      ...authHeaders,
      'X-User-Agent': userAgentHeader,
      'RC-User-Agent': userAgentHeader,
      ...headers
    }
  }

  _bearerAuthorizationHeader () {
    let accessToken = ''
    if (this._token) {
      accessToken = this._token.accessToken
    }
    return { Authorization: `Bearer ${accessToken}` }
  }

  _legacyHeader () {
    let accessToken = ''
    if (this._token) {
      accessToken = this._token.apiToken
    }
    return {
      'X-Auth-Token': accessToken
    }
  }
}

RingCentralEngageVoice.LEGACY_SERVERS = LEGACY_SERVERS
RingCentralEngageVoice.SERVER = SERVER

export default RingCentralEngageVoice
