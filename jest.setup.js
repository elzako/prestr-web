// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { mockAnimationsApi } from 'jsdom-testing-mocks'

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

