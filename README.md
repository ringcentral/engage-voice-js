# engage-voice-client-js

[![Build Status](https://travis-ci.org/ringcentral/engage-voice-client-js.svg?branch=release)](https://travis-ci.org/github/ringcentral/engage-voice-client-js)

RingCentral Engage Voice API js wrapper

## Use

```bash
npm i ringcentral-engage-voice-client
```

```js
import RingCentralEngageVoice from 'ringcentral-engage-voice-client'

// create from ringcentral app client id /secret
// you can create app from https://developer.ringcentral.com
const ev = new RingCentralEngageVoice({
  clientId: process.env.RINGCENTRAL_CLIENTID,
  clientSecret: process.env.RINGCENTRAL_CLIENTSECRET
})

// auth with password flow
await ev.authorize({
  username: process.env.RINGCENTRAL_USERNAME,
  extension: process.env.RINGCENTRAL_EXTENSION,
  password: process.env.RINGCENTRAL_PASSWORD
})

// can also auth with auth code flow
// check https://developers.ringcentral.com/guide/authentication for more detail
// await ev.authorize({
//   code: 'xxxx',
//   redirectUri: 'yyyyyy'
// })

// api request
// check all api doc from https://engage-voice-api-docs.readthedocs.io/en/latest/
let r = await ev.get('/api/v1/admin/accounts')
r = r.data
expect(r.length > 0).toBe(true)
```

For lagecy server use:

```js
import RingCentralEngageVoice from 'ringcentral-engage-voice-client'

// LAGECY_SERVER could be
// 'https://portal.vacd.biz',
// or  'https://portal.virtualacd.biz'
const ev = new RingCentralEngageVoice({
  server: process.env.LAGECY_SERVER
})

// only support username/password auth
await ev.authorize({
  username: process.env.LAGECY_USERNAME,
  password: process.env.LAGECY_PASSWORD
})

// api request
// check all api doc from https://engage-voice-api-docs.readthedocs.io/en/latest/
let r = await ev.get('/api/v1/admin/accounts')
r = r.data
expect(r.length > 0).toBe(true)

// revoke api token
ev.revokeLagecyToken()
```

## Instance methods

ev.request(config)

ev.get(url, config = {})

ev.post(url, data = undefined, config = {})

ev.put(url, data = undefined, config = {})

ev.delete (url, config = {})

ev.patch(url, data = undefined, config = {})

## Credits

Based on tyler's [ringcentral-js-concise](https://github.com/tylerlong/ringcentral-js-concise)

## License

MIT
