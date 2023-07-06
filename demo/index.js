const RingCentralEngageVoice = require('ringcentral-engage-voice-client').default

async function run () {
  const ev = new RingCentralEngageVoice({
    clientId: process.env.RINGCENTRAL_CLIENTID,
    clientSecret: process.env.RINGCENTRAL_CLIENTSECRET
  })
  await ev.authorize({
    jwt: process.env.RINGCENTRAL_JWT
  })
  let r = await ev.get('/api/v1/admin/accounts')
  r = r.data
  console.log(r)
}

run()
