/**
 * Tests for Typesense integration
 */

import { searchSlides } from '@/lib/search-actions'
import { createClient } from '@/lib/supabase/server'
import Typesense from 'typesense'

// Mock environment variables
process.env.TYPESENSE_HOST = 'localhost'
process.env.TYPESENSE_PORT = '8108'
process.env.TYPESENSE_PROTOCOL = 'http'
process.env.TYPESENSE_API_KEY = 'test-key'

// Mock Typesense
jest.mock('typesense', () => ({
  __esModule: true,
  default: {
    Client: jest.fn(),
  },
}))

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

// Mock Cloudinary
jest.mock('@/lib/cloudinary', () => ({
  getSlideImageUrl: jest.fn(
    (orgId, slideId, objId) =>
      `https://res.cloudinary.com/test/${orgId}/${slideId}/${objId}.png`,
  ),
}))

describe('Typesense Integration Tests', () => {
  let mockTypesenseClient: any
  let mockSupabaseClient: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock Typesense client
    const mockSearchMethod = jest.fn()
    const mockDocumentsMethod = jest.fn(() => ({ search: mockSearchMethod }))
    const mockCollectionsMethod = jest.fn(() => ({
      documents: mockDocumentsMethod,
    }))
    const mockHealthRetrieve = jest.fn().mockResolvedValue({ ok: true })

    mockTypesenseClient = {
      collections: mockCollectionsMethod,
      health: {
        retrieve: mockHealthRetrieve,
      },
    }

    ;(Typesense as unknown as { Client: jest.Mock }).Client.mockImplementation(
      () => mockTypesenseClient,
    )

    // Setup mock Supabase client
    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabaseClient)

    // Default folder lookup response
    mockSupabaseClient.single.mockResolvedValue({
      data: { full_path: 'test/folder/path' },
      error: null,
    })

    // Default search response
    mockTypesenseClient.collections().documents().search.mockResolvedValue({
      hits: [
        {
          document: {
            id: 'slide-1',
            slide_name: 'Test Slide',
            slide_text: 'Test content',
            organization_id: 'org-1',
            project_id: 'project-1',
            parent_id: 'folder-1',
            object_id: 'object-1',
            visibility: 'public',
          },
        },
      ],
      found: 1,
    })
  })

  describe('searchSlides - Query Building', () => {
    it('should build correct filter for public-only access (unauthenticated)', async () => {
      const result = await searchSlides({
        organizationId: 'org-1',
        query: 'test',
      })

      expect(mockTypesenseClient.collections).toHaveBeenCalledWith('slides')
      expect(
        mockTypesenseClient.collections().documents().search,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          q: 'test',
          filter_by: expect.stringContaining('visibility:=`public`'),
        }),
      )
      expect(result.success).toBe(true)
    })

    it('should build correct filter for authenticated users with organization roles', async () => {
      await searchSlides({
        organizationId: 'org-1',
        query: 'test',
        userRoles: {
          organizationRoles: ['org-1'],
          folderRoles: [],
        },
      })

      const searchCall =
        mockTypesenseClient.collections().documents().search.mock.calls[0]
      const filterString = searchCall[0].filter_by

      expect(filterString).toContain('visibility:=`public`')
      expect(filterString).toContain('visibility:=`internal`')
      expect(filterString).toContain('organization_id:=[`org-1`]')
    })

    it('should include restricted slides filter when user has folder roles', async () => {
      await searchSlides({
        organizationId: 'org-1',
        query: 'test',
        userRoles: {
          organizationRoles: ['org-1'],
          folderRoles: [{ folder_id: 'folder-1', user_role: 'member' }],
        },
      })

      const searchCall =
        mockTypesenseClient.collections().documents().search.mock.calls[0]
      const filterString = searchCall[0].filter_by

      expect(filterString).toContain('visibility:=`restricted`')
      expect(filterString).toContain('project_id:=[`folder-1`]')
    })

    it('should apply organization filter when provided', async () => {
      await searchSlides({
        organizationId: 'org-123',
        query: 'test',
      })

      const searchCall =
        mockTypesenseClient.collections().documents().search.mock.calls[0]
      const filterString = searchCall[0].filter_by

      expect(filterString).toContain('organization_id:=`org-123`')
    })

    it('should apply project filter when provided', async () => {
      await searchSlides({
        organizationId: 'org-1',
        projectId: 'project-456',
        query: 'test',
      })

      const searchCall =
        mockTypesenseClient.collections().documents().search.mock.calls[0]
      const filterString = searchCall[0].filter_by

      expect(filterString).toContain('project_id:=`project-456`')
    })

    it('should apply sub folder filters when provided', async () => {
      await searchSlides({
        organizationId: 'org-1',
        subFolderIds: ['folder-1', 'folder-2'],
        query: 'test',
      })

      const searchCall =
        mockTypesenseClient.collections().documents().search.mock.calls[0]
      const filterString = searchCall[0].filter_by

      expect(filterString).toContain(
        'parent_id:=[`folder-1`,`folder-2`]',
      )
    })
  })

  describe('searchSlides - Result Parsing and Formatting', () => {
    it('should parse and format search results correctly', async () => {
      const result = await searchSlides({
        organizationId: 'org-1',
        query: 'test',
      })

      expect(result.success).toBe(true)
      expect(result.results).toHaveLength(1)
      expect(result.results![0]).toMatchObject({
        id: 'slide-1',
        slide_name: 'Test Slide',
        organization_id: 'org-1',
      })
    })

    it('should add image URLs to results', async () => {
      const result = await searchSlides({
        organizationId: 'org-1',
        query: 'test',
      })

      expect(result.results![0].imageUrl).toBeDefined()
      expect(result.results![0].imageUrl).toContain('res.cloudinary.com')
    })

    it('should add parent path to results', async () => {
      const result = await searchSlides({
        organizationId: 'org-1',
        query: 'test',
      })

      expect(result.results![0].parent_path).toBe('test/folder/path')
    })

    it('should return total hits count', async () => {
      const result = await searchSlides({
        organizationId: 'org-1',
        query: 'test',
      })

      expect(result.total).toBe(1)
    })

    it('should handle empty search results', async () => {
      mockTypesenseClient.collections().documents().search.mockResolvedValue({
        hits: [],
        found: 0,
      })

      const result = await searchSlides({
        organizationId: 'org-1',
        query: 'nonexistent',
      })

      expect(result.success).toBe(true)
      expect(result.results).toHaveLength(0)
      expect(result.total).toBe(0)
    })
  })

  describe('searchSlides - Pagination', () => {
    it('should apply limit parameter correctly', async () => {
      await searchSlides({
        organizationId: 'org-1',
        query: 'test',
        limit: 10,
      })

      expect(
        mockTypesenseClient.collections().documents().search,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          per_page: 10,
        }),
      )
    })

    it('should apply offset parameter correctly', async () => {
      await searchSlides({
        organizationId: 'org-1',
        query: 'test',
        offset: 20,
      })

      expect(
        mockTypesenseClient.collections().documents().search,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
        }),
      )
    })

    it('should use default limit when not specified', async () => {
      await searchSlides({
        organizationId: 'org-1',
        query: 'test',
      })

      expect(
        mockTypesenseClient.collections().documents().search,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          per_page: 20,
        }),
      )
    })
  })

  describe('searchSlides - Error Handling', () => {
    it('should return error when search service is not configured', async () => {
      delete process.env.TYPESENSE_HOST

      const result = await searchSlides({
        organizationId: 'org-1',
        query: 'test',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Search service not configured')

      // Restore env var
      process.env.TYPESENSE_HOST = 'localhost'
    })

    it('should handle Typesense errors gracefully', async () => {
      mockTypesenseClient.collections().documents().search.mockRejectedValue(
        new Error('Search index not found'),
      )

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = await searchSlides({
        organizationId: 'org-1',
        query: 'test',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Search index not found')
      consoleSpy.mockRestore()
    })

    it('should handle network errors', async () => {
      mockTypesenseClient.collections().documents().search.mockRejectedValue(
        new Error('Network timeout'),
      )

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = await searchSlides({
        organizationId: 'org-1',
        query: 'test',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network timeout')
      consoleSpy.mockRestore()
    })

    it('should handle non-Error exceptions', async () => {
      mockTypesenseClient.collections().documents().search.mockRejectedValue(
        'Unknown error',
      )

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = await searchSlides({
        organizationId: 'org-1',
        query: 'test',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Search service unavailable')
      consoleSpy.mockRestore()
    })
  })
})
