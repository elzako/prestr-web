/**
 * Tests for Cloudinary integration
 */

import { getSlideImageUrl } from '@/lib/cloudinary'

// Mock Cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    url: jest.fn((publicId, options) => {
      // Simulate Cloudinary URL generation
      const baseUrl = 'https://res.cloudinary.com/test'
      const transformations = []

      if (options?.quality) transformations.push(`q_${options.quality}`)
      if (options?.fetch_format) transformations.push(`f_${options.fetch_format}`)

      const transformation = transformations.length > 0 ? `/${transformations.join(',')}` : ''
      const type = options?.type || 'upload'

      return `${baseUrl}/image/${type}${transformation}/${publicId}`
    }),
  },
}))

describe('Cloudinary Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getSlideImageUrl', () => {
    it('should generate correct Cloudinary URL for a slide', () => {
      const organizationId = 'org-123'
      const slideId = 'slide-456'
      const objectId = 'object-789'

      const url = getSlideImageUrl(organizationId, slideId, objectId)

      expect(url).toContain('res.cloudinary.com')
      expect(url).toContain(`${organizationId}/${slideId}/${objectId}.png`)
    })

    it('should include authentication type in URL', () => {
      const url = getSlideImageUrl('org-1', 'slide-1', 'obj-1')

      expect(url).toContain('/authenticated/')
    })

    it('should apply quality and format transformations', () => {
      const url = getSlideImageUrl('org-1', 'slide-1', 'obj-1')

      expect(url).toContain('q_auto')
      expect(url).toContain('f_auto')
    })

    it('should handle special characters in IDs', () => {
      const organizationId = 'org-with-dashes'
      const slideId = 'slide_with_underscores'
      const objectId = 'obj.with.dots'

      const url = getSlideImageUrl(organizationId, slideId, objectId)

      expect(url).toContain(`${organizationId}/${slideId}/${objectId}.png`)
    })

    it('should generate different URLs for different slides', () => {
      const url1 = getSlideImageUrl('org-1', 'slide-1', 'obj-1')
      const url2 = getSlideImageUrl('org-1', 'slide-2', 'obj-2')

      expect(url1).not.toBe(url2)
      expect(url1).toContain('slide-1')
      expect(url2).toContain('slide-2')
    })
  })

  describe('Cloudinary transformation parameter handling', () => {
    it('should apply auto quality optimization', () => {
      const url = getSlideImageUrl('org-1', 'slide-1', 'obj-1')

      expect(url).toContain('q_auto')
    })

    it('should apply auto format optimization', () => {
      const url = getSlideImageUrl('org-1', 'slide-1', 'obj-1')

      expect(url).toContain('f_auto')
    })

    it('should use secure HTTPS URLs', () => {
      const url = getSlideImageUrl('org-1', 'slide-1', 'obj-1')

      expect(url).toMatch(/^https:\/\//)
    })
  })

  describe('Cloudinary error scenarios', () => {
    it('should handle empty organization ID', () => {
      const url = getSlideImageUrl('', 'slide-1', 'obj-1')

      expect(url).toBeDefined()
      expect(typeof url).toBe('string')
    })

    it('should handle empty slide ID', () => {
      const url = getSlideImageUrl('org-1', '', 'obj-1')

      expect(url).toBeDefined()
      expect(typeof url).toBe('string')
    })

    it('should handle empty object ID', () => {
      const url = getSlideImageUrl('org-1', 'slide-1', '')

      expect(url).toBeDefined()
      expect(typeof url).toBe('string')
    })

    it('should handle very long IDs', () => {
      const longId = 'a'.repeat(1000)

      expect(() => {
        getSlideImageUrl(longId, longId, longId)
      }).not.toThrow()
    })
  })
})
