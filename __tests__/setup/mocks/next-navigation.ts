/**
 * Mock Next.js navigation hooks for testing
 *
 * These mocks allow you to test components that use Next.js navigation
 * without actually navigating or depending on the Next.js router.
 */

export const mockPush = jest.fn()
export const mockReplace = jest.fn()
export const mockRefresh = jest.fn()
export const mockBack = jest.fn()
export const mockForward = jest.fn()
export const mockPrefetch = jest.fn()

/**
 * Mock useRouter hook
 */
export const mockRouter = {
  push: mockPush,
  replace: mockReplace,
  refresh: mockRefresh,
  back: mockBack,
  forward: mockForward,
  prefetch: mockPrefetch,
}

/**
 * Mock usePathname hook
 */
export const mockPathname = '/'

/**
 * Mock useSearchParams hook
 */
export const mockSearchParams = new URLSearchParams()

/**
 * Mock useParams hook
 */
export const mockParams = {}

/**
 * Setup function to mock next/navigation
 */
export function mockNextNavigation() {
  jest.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
    usePathname: () => mockPathname,
    useSearchParams: () => mockSearchParams,
    useParams: () => mockParams,
    redirect: jest.fn(),
    notFound: jest.fn(),
  }))
}

/**
 * Reset all navigation mocks
 */
export function resetNavigationMocks() {
  mockPush.mockClear()
  mockReplace.mockClear()
  mockRefresh.mockClear()
  mockBack.mockClear()
  mockForward.mockClear()
  mockPrefetch.mockClear()
}
