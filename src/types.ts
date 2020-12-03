
export interface Options {
  clientId: string,
  clientSecret: string,
  server?: string,
  rcServer?: string,
  apiPrefix?: string
}

interface TokenBase {
  refreshToken?: string,
  accessToken?: string,
  apiToken?: string
}

export interface Token {
  [key : string]: any | TokenBase
}

export interface ConfigBase {
  url?: string,
  headers?: Object
}

export interface Config {
  [key : string]: any | ConfigBase
}

export interface Data {
  [key : string]: any
}
