global.RingCentral = require('@ringcentral/sdk')
global.axios = require('axios')

// eslint-disable-next-line
import RingCentralEngageVoice from 'ringcentral-engage-voice-client'

async function run () {
  const ev = new RingCentralEngageVoice({
    clientId: process.env.RINGCENTRAL_CLIENTID,
    clientSecret: process.env.RINGCENTRAL_CLIENTSECRET
  })
  await ev.authorize({
    username: process.env.RINGCENTRAL_USERNAME,
    extension: process.env.RINGCENTRAL_EXTENSION,
    password: process.env.RINGCENTRAL_PASSWORD
  })
  let r = await ev.get('/api/v1/admin/accounts')
  r = r.data
  console.log(r)
}

run()
