import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Mock Supabase client for testing
 *
 * This provides a mock implementation of the Supabase client
 * to avoid making real API calls during tests.
 */

type MockSupabaseClient = Partial<SupabaseClient<Database>>

/**
 * Creates a mock Supabase client with default implementations
 */
export function createMockSupabaseClient(
  overrides?: Partial<MockSupabaseClient>,
): MockSupabaseClient {
  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
  }

  const mockClient: MockSupabaseClient = {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({
        error: null,
      }),
      signUp: jest.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
    } as any,
    from: jest.fn().mockReturnValue(mockQueryBuilder),
    ...overrides,
  }

  return mockClient
}

/**
 * Mock authenticated user
 */
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
}

/**
 * Mock session
 */
export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
}

/**
 * Helper to mock authenticated state
 */
export function mockAuthenticatedSupabase(): MockSupabaseClient {
  return createMockSupabaseClient({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null,
      }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null,
      }),
    } as any,
  })
}

/**
 * Helper to mock unauthenticated state
 */
export function mockUnauthenticatedSupabase(): MockSupabaseClient {
  return createMockSupabaseClient({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
    } as any,
  })
}
