/* eslint-env jest */
import { ev } from './setup'

jest.setTimeout(64000)

function wait (ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}

describe('Accounts', () => {
  test('get account list', async () => {
    await ev.refresh()
    await wait(
      1000 * 60 * 6
    )
    let r = await ev.get('/api/v1/admin/accounts')
    r = r.data
    try {
      await ev.post('/api/vx/admin/accounts')
    } catch (e) {
      expect(e.status).toBe(404)
      // console.log(e)
    }
    try {
      await ev.put('/api/vx/admin/accounts')
    } catch (e) {
      expect(e.status).toBe(404)
      // console.log(e)
    }
    try {
      await ev.patch('/api/vx/admin/accounts')
    } catch (e) {
      expect(e.status).toBe(404)
      // console.log(e)
    }
    try {
      await ev.delete('/api/vx/admin/accounts')
    } catch (e) {
      expect(e.status).toBe(404)
      // console.log(e)
    }
    expect(r.length > 0).toBe(true)
  })
})
