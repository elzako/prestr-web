jest.mock('next/server', () => {
  const cookieStoreFactory = () => {
    const store = new Map<string, { value: string; options?: Record<string, unknown> }>()

    return {
      set: jest.fn((name: string, value: string, options?: Record<string, unknown>) => {
        store.set(name, { value, options })
      }),
      getAll: jest.fn(() =>
        Array.from(store.entries()).map(([name, { value, options }]) => ({
          name,
          value,
          options,
        })),
      ),
      dump: () => store,
    }
  }

  const headersFactory = () => {
    const store = new Map<string, string>()

    return {
      get: (key: string) => store.get(key.toLowerCase()) ?? null,
      set: (key: string, value: string) => {
        store.set(key.toLowerCase(), value)
      },
      dump: () => store,
    }
  }

  const next = jest.fn(({ request }: { request?: unknown } = {}) => ({
    status: 200,
    request,
    headers: headersFactory(),
    cookies: cookieStoreFactory(),
  }))

  const redirect = jest.fn((url: URL | string) => {
    const headers = headersFactory()
    headers.set('location', typeof url === 'string' ? url : url.toString())

    return {
      status: 307,
      headers,
      cookies: cookieStoreFactory(),
    }
  })

  return {
    NextResponse: {
      next,
      redirect,
    },
  }
})

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}))

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { middleware } from '../middleware'

function buildUrlWrapper(url: URL) {
  return {
    get pathname() {
      return url.pathname
    },
    set pathname(value: string) {
      url.pathname = value
    },
    get searchParams() {
      return url.searchParams
    },
    clone() {
      return buildUrlWrapper(new URL(url.toString()))
    },
    toString() {
      return url.toString()
    },
  }
}

type MockRequest = {
  cookies: {
    getAll: jest.Mock
    set: jest.Mock
  }
  nextUrl: ReturnType<typeof buildUrlWrapper>
  headers: Map<string, string>
}

function createMockRequest(path: string): MockRequest {
  const url = new URL(path, 'http://localhost')
  const cookieJar = new Map<string, string>()

  return {
    cookies: {
      getAll: jest.fn(() =>
        Array.from(cookieJar.entries()).map(([name, value]) => ({ name, value })),
      ),
      set: jest.fn((name: string, value: string) => {
        cookieJar.set(name, value)
      }),
    },
    nextUrl: buildUrlWrapper(url),
    headers: new Map(),
  }
}

describe('middleware route protection', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    jest.clearAllMocks()
    ;(createServerClient as jest.Mock).mockReset()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('redirects unauthenticated users from protected routes', async () => {
    const getUser = jest.fn().mockResolvedValue({ data: { user: null } })
    ;(createServerClient as jest.Mock).mockReturnValue({ auth: { getUser } })

    const request = createMockRequest('/dashboard')
    await middleware(request as any)

    const redirectSpy = NextResponse.redirect as jest.Mock
    expect(redirectSpy).toHaveBeenCalledTimes(1)

    const [redirectTarget] = redirectSpy.mock.calls.at(-1)!
    expect(redirectTarget.toString()).toBe(
      'http://localhost/login?redirectedFrom=%2Fdashboard',
    )

    const redirectResult = redirectSpy.mock.results.at(-1)?.value
    expect(redirectResult.status).toBe(307)
    expect(redirectResult.headers.get('location')).toBe(
      'http://localhost/login?redirectedFrom=%2Fdashboard',
    )
  })

  it('redirects authenticated users away from auth routes', async () => {
    const getUser = jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } })
    ;(createServerClient as jest.Mock).mockReturnValue({ auth: { getUser } })

    const request = createMockRequest('/login')
    await middleware(request as any)

    const redirectSpy = NextResponse.redirect as jest.Mock
    expect(redirectSpy).toHaveBeenCalledTimes(1)

    const [redirectTarget] = redirectSpy.mock.calls.at(-1)!
    expect(redirectTarget.toString()).toBe('http://localhost/')

    const redirectResult = redirectSpy.mock.results.at(-1)?.value
    expect(redirectResult.status).toBe(307)
    expect(redirectResult.headers.get('location')).toBe('http://localhost/')
  })

  it('treats organization routes as protected when unauthenticated', async () => {
    const getUser = jest.fn().mockResolvedValue({ data: { user: null } })
    ;(createServerClient as jest.Mock).mockReturnValue({ auth: { getUser } })

    const request = createMockRequest('/acme/projects')
    await middleware(request as any)

    const redirectSpy = NextResponse.redirect as jest.Mock
    expect(redirectSpy).toHaveBeenCalledTimes(1)

    const [redirectTarget] = redirectSpy.mock.calls.at(-1)!
    expect(redirectTarget.toString()).toBe(
      'http://localhost/login?redirectedFrom=%2Facme%2Fprojects',
    )

    const redirectResult = redirectSpy.mock.results.at(-1)?.value
    expect(redirectResult.status).toBe(307)
    expect(redirectResult.headers.get('location')).toBe(
      'http://localhost/login?redirectedFrom=%2Facme%2Fprojects',
    )
  })
})
