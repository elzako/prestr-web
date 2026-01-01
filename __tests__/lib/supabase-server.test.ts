jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}))
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { createAdminClient, createClient } from '@/lib/supabase/server'

describe('Supabase server client cookie integration', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetAllMocks()
    process.env = { ...originalEnv }
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_ANON_KEY = 'anon-key'
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('passes through cookie getters and setters for createClient', async () => {
    const cookieList = [{ name: 'sb', value: 'token', options: { path: '/' } }]
    const getAll = jest.fn(() => cookieList)
    const set = jest.fn()
    ;(cookies as jest.Mock).mockResolvedValue({ getAll, set })

    const supabaseStub = { auth: { getUser: jest.fn() } }
    ;(createServerClient as jest.Mock).mockReturnValue(supabaseStub)

    const client = await createClient()

    expect(client).toBe(supabaseStub)

    const config = (createServerClient as jest.Mock).mock.calls[0][2]
    expect(config.cookies.getAll()).toEqual(cookieList)

    const cookiesToSet = [
      {
        name: 'sb-refresh-token',
        value: 'abc',
        options: { path: '/', httpOnly: true },
      },
    ]

    config.cookies.setAll(cookiesToSet)

    expect(set).toHaveBeenCalledWith(
      'sb-refresh-token',
      'abc',
      cookiesToSet[0].options,
    )
  })

  it('swallows cookie write errors when createClient setters fail', async () => {
    const set = jest.fn(() => {
      throw new Error('read-only')
    })
    ;(cookies as jest.Mock).mockResolvedValue({
      getAll: jest.fn(() => []),
      set,
    })
    ;(createServerClient as jest.Mock).mockReturnValue({})

    await createClient()

    const config = (createServerClient as jest.Mock).mock.calls[0][2]

    expect(() =>
      config.cookies.setAll([
        { name: 'sb', value: 'token', options: { path: '/' } },
      ]),
    ).not.toThrow()
  })

  it('enforces secure cookie attributes for admin client in production', async () => {
    const restoreNodeEnv = jest.replaceProperty(
      process.env,
      'NODE_ENV',
      'production',
    )

    const set = jest.fn()
    ;(cookies as jest.Mock).mockResolvedValue({
      getAll: jest.fn(() => []),
      set,
    })

    const supabaseStub = { auth: { getUser: jest.fn() } }
    ;(createServerClient as jest.Mock).mockReturnValue(supabaseStub)

    try {
      await createAdminClient()

      const config = (createServerClient as jest.Mock).mock.calls[0][2]

      const cookieOptions = { domain: 'example.com', path: '/' }
      config.cookies.setAll([
        { name: 'sb-admin-token', value: 'secret', options: cookieOptions },
      ])

      expect(set).toHaveBeenCalledWith(
        'sb-admin-token',
        'secret',
        expect.objectContaining({
          domain: 'example.com',
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
        }),
      )
    } finally {
      restoreNodeEnv.restore()
    }
  })
})
