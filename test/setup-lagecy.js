/* eslint-env jest */
import RingCentral from '../src/engage-voice'

let ev

beforeAll(async done => {
  jest.setTimeout(64000)
  ev = new RingCentral({
    server: process.env.LAGECY_SERVER
  })
  await ev.authorize({
    username: process.env.LAGECY_USERNAME,
    password: process.env.LAGECY_PASSWORD
  })
  console.log(ev._token)
  done()
})

afterAll(async done => {
  await ev.revokeLagecyToken()
  done()
})

export { ev }
