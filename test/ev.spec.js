/* eslint-env jest */
import { ev } from './setup'

jest.setTimeout(64000)

describe('Accounts', () => {
  test('get account list', async () => {
    let r = ev.get('/api/v1/admin/accounts')
    r = r.data
    console.log(r)
    expect(r.length > 0).toBe(true)
  })
})
