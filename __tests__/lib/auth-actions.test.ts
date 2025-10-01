/**
 * Tests for authentication actions
 */

import { login, signup, logout, getUser, getUserProfile } from '@/lib/auth-actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

describe('Authentication Actions', () => {
  let mockSupabaseClient: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mock Supabase client
    mockSupabaseClient = {
      auth: {
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabaseClient)
  })

  describe('login', () => {
    it('should successfully log in a user', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: '1', email: 'test@example.com' } },
        error: null,
      })

      await login(formData)

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
      expect(redirect).toHaveBeenCalledWith('/')
    })

    it('should return error on failed login', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'wrongpassword')

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      })

      const result = await login(formData)

      expect(result).toEqual({ error: 'Invalid credentials' })
      expect(redirect).not.toHaveBeenCalled()
    })
  })

  describe('signup', () => {
    it('should successfully sign up a new user', async () => {
      const formData = new FormData()
      formData.append('email', 'newuser@example.com')
      formData.append('password', 'password123')

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: { id: '1', email: 'newuser@example.com' } },
        error: null,
      })

      const result = await signup(formData)

      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
      })
      expect(result).toEqual({
        success: true,
        message: 'Check your email to continue signing up',
      })
    })

    it('should return error on failed signup', async () => {
      const formData = new FormData()
      formData.append('email', 'existing@example.com')
      formData.append('password', 'password123')

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already exists' },
      })

      const result = await signup(formData)

      expect(result).toEqual({ error: 'User already exists' })
    })
  })

  describe('logout', () => {
    it('should successfully log out a user', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      })

      await logout()

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
      expect(redirect).toHaveBeenCalledWith('/login')
    })

    it('should return error on failed logout', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: { message: 'Logout failed' },
      })

      const result = await logout()

      expect(result).toEqual({ error: 'Logout failed' })
      expect(redirect).not.toHaveBeenCalled()
    })
  })

  describe('getUser', () => {
    it('should return user when authenticated', async () => {
      const mockUser = { id: '1', email: 'test@example.com' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await getUser()

      expect(result).toEqual(mockUser)
    })

    it('should return null when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await getUser()

      expect(result).toBeNull()
    })

    it('should return null on error', async () => {
      mockSupabaseClient.auth.getUser.mockRejectedValue(
        new Error('Network error'),
      )

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = await getUser()

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('getUserProfile', () => {
    it('should return user profile when authenticated', async () => {
      const mockUser = { id: '1', email: 'test@example.com' }
      const mockProfile = {
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      })

      const result = await getUserProfile()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_profiles')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(mockProfile)
    })

    it('should return null when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await getUserProfile()

      expect(result).toBeNull()
    })

    it('should return null on database error', async () => {
      const mockUser = { id: '1', email: 'test@example.com' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Profile not found' },
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = await getUserProfile()

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})
