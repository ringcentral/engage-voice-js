/* eslint-env jest */
import { ev } from './setup-lagecy'

jest.setTimeout(64000)

describe('Accounts lagecy', () => {
  test('get account list', async () => {
    let r = await ev.get('/api/v1/admin/accounts')
    r = r.data
    expect(r.length > 0).toBe(true)
  })
})
