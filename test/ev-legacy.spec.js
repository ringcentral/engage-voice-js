/* eslint-env jest */
import { ev } from './setup-legacy'

jest.setTimeout(64000)

describe('Accounts legacy', () => {
  test('get account list', async () => {
    let r = await ev.get('/api/v1/admin/accounts')
    expect(r.config.headers['Content-Type']).toBe('application/json')
    r = r.data
    expect(r.length > 0).toBe(true)
  })
})
