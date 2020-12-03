/* eslint-env jest */
import RingCentral from '../src/engage-voice.ts'

let ev

beforeAll(async done => {
  jest.setTimeout(64000)
  ev = new RingCentral({
    server: process.env.LEGACY_SERVER
  })
  await ev.authorize({
    username: process.env.LEGACY_USERNAME,
    password: process.env.LEGACY_PASSWORD
  }).catch(console.log)
  done()
})

afterAll(async done => {
  await ev.revokeLegacyToken().catch(console.log)
  done()
})

export { ev }
