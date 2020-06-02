/* eslint-env jest */
import RingCentral from '../src/engage-voice'

let ev

beforeAll(async done => {
  jest.setTimeout(64000)
  ev = new RingCentral({
    server: process.env.LEGACY_SERVER
  })
  await ev.authorize({
    username: process.env.LEGACY_USERNAME,
    password: process.env.LEGACY_PASSWORD
  })
  // console.log(ev._token)
  done()
})

afterAll(async done => {
  await ev.revokeLegacyToken()
  done()
})

export { ev }
