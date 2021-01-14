import axios, { AxiosInstance } from 'axios'
import { SDK, LoginOptions } from '@ringcentral/sdk'
import { URL } from 'url'
import { EventEmitter } from 'events'
import { Options, Token, Config, Data } from './types'

const version = process.env.version

/* istanbul ignore next */
export class HTTPError extends Error {
  status: number
  statusText: string
  data: Data
  config: Config
  constructor (status: number, statusText: string, data: Data, config: Config) {
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

class RingCentralEngageVoice extends EventEmitter {
  clientId: string
  server: string
  clientSecret: string
  rcServer: string
  apiPrefix: string
  redirectUri: string | undefined
  _axios: AxiosInstance
  _token: Token | undefined
  isLegacy: Boolean
  rc: SDK

  static LEGACY_SERVERS = [
    'https://portal.vacd.biz',
    'https://portal.virtualacd.biz'
  ]

  static SERVER = 'https://engage.ringcentral.com'

  static RINGCENTRAL_SERVER = 'https://platform.ringcentral.com'

  constructor ({
    clientId,
    clientSecret,
    server = RingCentralEngageVoice.SERVER,
    rcServer = RingCentralEngageVoice.RINGCENTRAL_SERVER,
    apiPrefix = 'voice'
  }: Options) {
    super()
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.server = server
    this.rcServer = rcServer
    this.apiPrefix = apiPrefix
    this.isLegacy = this.isLegacyServer(server)
    this.rc = new SDK({
      server: rcServer,
      clientId,
      clientSecret
    })
    this._axios = axios.create()
    const request = this._axios.request.bind(this._axios)
    this._axios.request = async config => { // try to refresh token if necessary
      try {
        return await request(config)
      } catch (e) {
        /* istanbul ignore next */
        if (e.response) {
          if (/\bexpired\b/i.test(e.response.data)) { // access token expired
            try {
              console.log('on token expire e.response.data:', e.response.data)
              await this.refresh()
              config.headers = { ...config.headers, ...this._bearerAuthorizationHeader() }
              return await request(config)
            } catch (e) {
              if (e.response) {
                throw new HTTPError(e.response.status, e.response.statusText, e.response.data, e.response.config)
              }
              throw e
            }
          } else {
            throw new HTTPError(e.response.status, e.response.statusText, e.response.data, e.response.config)
          }
        } else {
          throw e
        }
      }
    }
  }

  token (_token: Token) {
    if (arguments.length === 0) {
      return this._token
    }
    const tokenChanged = this._token !== _token
    this._token = _token
    if (tokenChanged) {
      this.emit('tokenChanged', _token)
    }
  }

  refresh () {
    return this.getToken(
      this._token ? this._token.refreshToken : ''
    )
  }

  isLegacyServer (server: string) {
    return RingCentralEngageVoice.LEGACY_SERVERS.includes(server)
  }

  request (config: Config) {
    let u = config.url
    if (!config.url.startsWith('http')) {
      const { url = '' } = config
      const prefix = url.startsWith(this.apiPrefix) || url.startsWith('/' + this.apiPrefix)
        ? '/'
        : '/' + this.apiPrefix + '/'
      u = new URL(url.replace(/^\//, ''), this.server + prefix).toString()
    }
    return this._axios.request({
      ...config,
      url: u,
      headers: this._patchHeaders(config.headers)
    })
  }

  async authorize (options: LoginOptions) {
    if (this.isLegacy) {
      await this.legacyAuthorize(options)
    } else {
      await this.rc.login(options)
      await this.getToken(undefined)
    }
  }

  async legacyAuthorize (options: LoginOptions) {
    await this.getLegacyToken(options)
  }

  async getLegacyToken ({
    username,
    password
  }: LoginOptions) {
    const url = this.server + '/api/v1/auth/login'
    const body = `username=${encodeURIComponent(username || '')}&password=${password}`
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
      return this.delete(`/api/v1/admin/token/${this._token.apiToken}`)
    }
  }

  async getToken (refreshToken: string | undefined) {
    const url = refreshToken
      ? this.server + '/api/auth/token/refresh'
      : this.server + '/api/auth/login/rc/accesstoken?includeRefresh=true'
    let token = refreshToken
    if (!token) {
      const d = await this.rc.platform().auth().data() || {}
      token = d.access_token || ''
    }
    const body = refreshToken
      ? 'refresh_token=' + token + '&rcTokenType=Bearer'
      : 'rcAccessToken=' + token + '&rcTokenType=Bearer'
    const res = await this._axios.request({
      method: 'post',
      url,
      data: body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    const r = res.data
    this.token(r)
  }

  _patchHeaders (headers: Data = {}) {
    const userAgentHeader = `ringcentral-engage-voice-js/v${version}`
    const authHeaders = this.isLegacy
      ? this._legacyHeader()
      : this._bearerAuthorizationHeader()
    return {
      ...authHeaders,
      'Content-Type': 'application/json',
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

  get (url: string, config: Config = {}) {
    return this.request({ ...config, method: 'get', url })
  }

  delete (url: string, config: Config = {}) {
    return this.request({ ...config, method: 'delete', url })
  }

  post (url: string, data: Data | undefined = undefined, config: Config = {}) {
    return this.request({ ...config, method: 'post', url, data })
  }

  put (url: string, data: Data | undefined = undefined, config: Config = {}) {
    return this.request({ ...config, method: 'put', url, data })
  }

  patch (url: string, data: Data | undefined = undefined, config: Config = {}) {
    return this.request({ ...config, method: 'patch', url, data })
  }
}

export default RingCentralEngageVoice
