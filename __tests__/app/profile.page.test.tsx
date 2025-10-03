import { render, screen } from '../setup/render'
import ProfilePage from '../../src/app/profile/page'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const getUserMock = jest.fn()
const getUserProfileMock = jest.fn()
const redirectMock = jest.fn()

jest.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => redirectMock(...args),
}))

jest.mock('@/lib/auth-actions', () => ({
  getUser: () => getUserMock(),
  getUserProfile: () => getUserProfileMock(),
}))

jest.mock('@/components/HeaderWrapper', () => {
  const React = require('react')
  return {
    HeaderWrapper: () =>
      React.createElement('div', { 'data-testid': 'header-wrapper' }),
  }
})

jest.mock('@/components/Container', () => {
  const React = require('react')
  return {
    Container: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'container' }, children),
  }
})

jest.mock('@/app/profile/ProfileClient', () => {
  const React = require('react')
  return {
    ProfileClient: jest.fn((props: unknown) =>
      React.createElement('div', { 'data-testid': 'profile-client' }),
    ),
  }
})

const { ProfileClient } = jest.requireMock('@/app/profile/ProfileClient') as {
  ProfileClient: jest.Mock
}

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    redirectMock.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })
  })

  it('renders the profile surface when a user is authenticated', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00Z',
      role: 'authenticated',
    } as unknown as User

    type UserProfile = Database['public']['Tables']['user_profiles']['Row']
    const mockProfile: UserProfile = {
      id: 'user-123',
      metadata: { firstName: 'Jane', lastName: 'Doe' },
      deleted_at: null,
      deleted_by: null,
    }

    getUserMock.mockResolvedValue(mockUser)
    getUserProfileMock.mockResolvedValue(mockProfile)

    const page = await ProfilePage()
    render(page)

    expect(screen.getByRole('heading', { name: /your profile/i })).toBeInTheDocument()
    expect(screen.getByTestId('profile-client')).toBeInTheDocument()
    const profileClientProps = ProfileClient.mock.calls[0]?.[0]
    expect(profileClientProps).toMatchObject({
      user: mockUser,
      initialUserProfile: mockProfile,
    })
  })

  it('redirects to the login page when no user session is present', async () => {
    getUserMock.mockResolvedValue(null)

    await expect(ProfilePage()).rejects.toThrow('NEXT_REDIRECT')
    expect(redirectMock).toHaveBeenCalledWith('/login')
    expect(getUserProfileMock).not.toHaveBeenCalled()
  })
})




