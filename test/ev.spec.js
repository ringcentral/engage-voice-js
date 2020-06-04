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
    expect(r.length > 0).toBe(true)
  })
})
