'use server'

import { MeiliSearch } from 'meilisearch'
import { getSlideImageUrl } from './cloudinary'

interface MeiliSearchSlideResult {
  id: string
  object_id: string
  visibility: 'public' | 'private' | 'restricted'
  organization_id: string
  project_id: string
  tags: string[] | null
  slide_text: string
  notes_text: string
  has_chart: boolean
  has_table: boolean
  has_diagram: boolean
  has_image: boolean
  has_bullet: boolean
  has_links: boolean
  links: string[]
  has_video: boolean
  has_audio: boolean
  layout_name: string
  theme_name: string
  slide_name: string
  description: string
  created_at: string
  updated_at: string
}

interface MeiliSearchResponse {
  results: MeiliSearchSlideResult[]
  offset: number
  limit: number
  total: number
}

interface SearchResult extends MeiliSearchSlideResult {
  imageUrl?: string
}

interface SearchOptions {
  organizationId: string
  query: string
  limit?: number
  offset?: number
  filters?: string[]
}

export async function searchSlides(options: SearchOptions): Promise<{
  success: boolean
  results?: SearchResult[]
  total?: number
  error?: string
}> {
  const { organizationId, query, limit = 20, offset = 0, filters = [] } = options

  // Check if MeiliSearch is configured
  const searchUrl = process.env.NEXT_PUBLIC_SEARCH_URL
  const searchKey = process.env.NEXT_PUBLIC_SEARCH_KEY

  if (!searchUrl || !searchKey) {
    return {
      success: false,
      error: 'Search service not configured'
    }
  }

  try {
    // Initialize MeiliSearch client
    const client = new MeiliSearch({
      host: searchUrl,
      apiKey: searchKey,
    })

    // Get the slides index
    const index = client.index('slides')

    // Build filter string for organization
    const orgFilter = `organization_id = "${organizationId}"`
    const allFilters = [orgFilter, ...filters].join(' AND ')

    // Perform search
    const searchResponse = await index.search(query, {
      limit,
      offset,
      filter: allFilters,
      attributesToHighlight: ['slide_text', 'description', 'slide_name'],
    })

    // Map results and add image URLs (server-side only)
    const resultsWithImages: SearchResult[] = searchResponse.hits.map((hit) => {
      const result = hit as MeiliSearchSlideResult
      
      // Generate image URL server-side
      const imageUrl = getSlideImageUrl(
        result.organization_id,
        result.id,
        result.object_id
      )

      return {
        ...result,
        imageUrl,
      }
    })

    return {
      success: true,
      results: resultsWithImages,
      total: searchResponse.totalHits,
    }
  } catch (error) {
    console.error('MeiliSearch error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Search service unavailable',
    }
  }
}