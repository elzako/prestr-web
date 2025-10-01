/**
 * Tests for project database query helpers
 */

import { createProject } from '@/lib/project-actions'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Mock Next.js modules
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

describe('Project Actions - Database Query Helpers', () => {
  let mockSupabaseClient: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mock Supabase client
    mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      single: jest.fn(),
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabaseClient)
  })

  describe('createProject', () => {
    it('should successfully create a project', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' }
      const mockOrg = { id: 'org-1', organization_name: 'test-org' }

      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock organization lookup
      mockSupabaseClient.single
        .mockResolvedValueOnce({
          data: mockOrg,
          error: null,
        })
        // Mock user permissions check
        .mockResolvedValueOnce({
          data: { user_role: 'owner' },
          error: null,
        })
        // Mock check for existing project
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' }, // Not found
        })
        // Mock insert result
        .mockResolvedValueOnce({
          data: { id: 'project-1', folder_name: 'New Project' },
          error: null,
        })

      const result = await createProject('test-org', {
        folderName: 'New Project',
        description: 'Test description',
        tags: ['tag1'],
        visibility: 'internal',
      })

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('organizations')
      expect(mockSupabaseClient.from).toHaveBeenCalledWith(
        'user_organization_roles',
      )
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('folders')
    })

    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = await createProject('test-org', {
        folderName: 'New Project',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('User not authenticated')
      consoleSpy.mockRestore()
    })

    it('should return error when organization is not found', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = await createProject('nonexistent-org', {
        folderName: 'New Project',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Organization not found')
      consoleSpy.mockRestore()
    })

    it('should return error when user has insufficient permissions', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' }
      const mockOrg = { id: 'org-1', organization_name: 'test-org' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single
        .mockResolvedValueOnce({
          data: mockOrg,
          error: null,
        })
        .mockResolvedValueOnce({
          data: { user_role: 'member' }, // Member doesn't have permission
          error: null,
        })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = await createProject('test-org', {
        folderName: 'New Project',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Insufficient permissions to create projects')
      consoleSpy.mockRestore()
    })

    it('should return error when project name already exists', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' }
      const mockOrg = { id: 'org-1', organization_name: 'test-org' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single
        .mockResolvedValueOnce({
          data: mockOrg,
          error: null,
        })
        .mockResolvedValueOnce({
          data: { user_role: 'owner' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: 'existing-project' }, // Project exists
          error: null,
        })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = await createProject('test-org', {
        folderName: 'Existing Project',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('A project with this name already exists')
      consoleSpy.mockRestore()
    })
  })

  describe('Database query error handling', () => {
    it('should handle database connection errors', async () => {
      mockSupabaseClient.auth.getUser.mockRejectedValue(
        new Error('Database connection failed'),
      )

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = await createProject('test-org', {
        folderName: 'New Project',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database connection failed')
      consoleSpy.mockRestore()
    })

    it('should handle timeout errors', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockRejectedValue(new Error('Query timeout'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = await createProject('test-org', {
        folderName: 'New Project',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Query timeout')
      consoleSpy.mockRestore()
    })
  })
})
