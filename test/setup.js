/* eslint-env jest */
import RingCentral from '../src/engage-voice'

let ev

beforeAll(async done => {
  jest.setTimeout(64000)
  console.log(
    process.env.RINGCENTRAL_CLIENTID,
    process.env.RINGCENTRAL_CLIENTSECRET
  )
  ev = new RingCentral(process.env.RINGCENTRAL_CLIENTID, process.env.RINGCENTRAL_CLIENTSECRET)
  await ev.authorize({
    username: process.env.RINGCENTRAL_USERNAME,
    extension: process.env.RINGCENTRAL_EXTENSION,
    password: process.env.RINGCENTRAL_PASSWORD
  })
  done()
})

afterAll(async done => {
  await ev.rc.revoke()
  done()
})

export { ev }
