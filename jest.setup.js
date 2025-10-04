// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { mockAnimationsApi } from 'jsdom-testing-mocks'
import './__tests__/setup/polyfills'

const cookieStore = new Map()

const createCookieStoreApi = () => ({
  get(name) {
    if (!cookieStore.has(name)) {
      return undefined
    }
    return { name, value: cookieStore.get(name) }
  },
  getAll() {
    return Array.from(cookieStore.entries()).map(([name, value]) => ({
      name,
      value,
    }))
  },
  set(name, value) {
    if (value && typeof value === 'object' && 'value' in value) {
      cookieStore.set(name, value.value)
    } else {
      cookieStore.set(name, value)
    }
  },
  delete(name) {
    cookieStore.delete(name)
  },
  has(name) {
    return cookieStore.has(name)
  },
})

jest.mock('next/headers', () => ({
  cookies: jest.fn(async () => createCookieStoreApi()),
  headers: jest.fn(() => new Headers()),
}))

import { mswServer } from './__tests__/setup/msw/server'

// Mock animations API for Headless UI components
mockAnimationsApi()

// Mock ResizeObserver for Headless UI components
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Helper to properly mock window.location in tests
// This avoids JSDOM navigation errors
global.mockWindowLocation = (properties = {}) => {
  const defaultOverrides = {
    href: 'http://localhost/',
    origin: 'http://localhost',
    protocol: 'http:',
    host: 'localhost',
    hostname: 'localhost',
    port: '',
    pathname: '/',
    search: '',
    hash: '',
    reload: jest.fn(),
    replace: jest.fn(),
    assign: jest.fn(),
  }

  const overrides = {
    ...defaultOverrides,
    ...properties,
  }

  Object.entries(overrides).forEach(([key, value]) => {
    try {
      Object.defineProperty(window.location, key, {
        configurable: true,
        value,
      })
    } catch {
      try {
        window.location[key] = value
      } catch {
        // Some properties (like href) throw when reassigned; ignore those.
      }
    }
  })

  return window.location
}

beforeEach(() => {
  cookieStore.clear()
})

beforeAll(() => mswServer.listen({ onUnhandledRequest: 'error' }))
afterEach(() => mswServer.resetHandlers())
afterAll(() => mswServer.close())
