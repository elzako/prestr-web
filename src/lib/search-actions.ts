'use server'

import { MeiliSearch } from 'meilisearch'
import { getSlideImageUrl } from './cloudinary'
import { createClient } from './supabase/server'

interface MeiliSearchSlideResult {
  id: string
  object_id: string

  parent_id: string
  parent_path: string | null
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
  const {
    organizationId,
    query,
    limit = 20,
    offset = 0,
    filters = [],
  } = options

  // Check if MeiliSearch is configured
  const searchUrl = process.env.NEXT_PUBLIC_SEARCH_URL
  const searchKey = process.env.NEXT_PUBLIC_SEARCH_KEY

  if (!searchUrl || !searchKey) {
    return {
      success: false,
      error: 'Search service not configured',
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

    const supabase = await createClient()

    // Perform search
    const searchResponse = await index.search(query, {
      limit,
      offset,
      filter: allFilters,
      attributesToHighlight: ['slide_text', 'description', 'slide_name'],
    })

    // Map results and add image URLs and parent paths (server-side only)
    const resultsWithImages: SearchResult[] = await Promise.all(
      searchResponse.hits.map(async (hit) => {
        const result = hit as MeiliSearchSlideResult

        // Generate image URL server-side
        const imageUrl = getSlideImageUrl(
          result.organization_id,
          result.id,
          result.object_id,
        )

        // Fetch parent folder path
        const { data: folder } = await supabase
          .from('folders')
          .select('full_path')
          .eq('id', result.parent_id)
          .single()

        const parent_path = folder?.full_path || null

        return {
          ...result,
          imageUrl,
          parent_path,
        }
      }),
    )

    return {
      success: true,
      results: resultsWithImages,
      total: searchResponse.estimatedTotalHits,
    }
  } catch (error) {
    console.error('MeiliSearch error:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Search service unavailable',
    }
  }
}
