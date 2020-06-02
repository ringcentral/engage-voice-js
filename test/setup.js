/* eslint-env jest */
import RingCentral from '../src/engage-voice'

let ev

beforeAll(async done => {
  jest.setTimeout(64000)
  ev = new RingCentral({
    clientId: process.env.RINGCENTRAL_CLIENTID,
    clientSecret: process.env.RINGCENTRAL_CLIENTSECRET
  })
  await ev.authorize({
    username: process.env.RINGCENTRAL_USERNAME,
    extension: process.env.RINGCENTRAL_EXTENSION,
    password: process.env.RINGCENTRAL_PASSWORD
  })
  // console.log(ev._token)
  done()
})

afterAll(async done => {
  await ev.rc.revoke()
  done()
})

export { ev }
