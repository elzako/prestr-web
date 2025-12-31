import type { Enums } from '@/types/database.types'
import type { UserRoles } from '../entities'

/**
 * Search API types
 *
 * These types define the data structures used for search functionality,
 * including Typesense integration and role-based filtering.
 */

// Typesense slide result (from search service)
export interface TypesenseSlideResult {
  id: string
  object_id: string
  parent_id: string
  parent_path: string | null
  visibility: Enums<'visibility_options'>
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
  file_name: string
  description: string
  created_at: string
  updated_at: string
}

// Typesense API response wrapper
export interface TypesenseSearchResponse {
  results: TypesenseSlideResult[]
  offset: number
  limit: number
  total: number
}

/**
 * Enhanced search result with additional computed fields
 *
 * Extends the raw Typesense result with additional computed properties
 * like imageUrl for display purposes. This is the primary interface used
 * by search result components.
 */
export interface SearchResult extends TypesenseSlideResult {
  imageUrl?: string
}

// Search request options
export interface SearchOptions {
  organizationId: string
  projectId?: string | null
  subFolderIds?: string[] | null
  query: string
  limit?: number
  offset?: number
  filters?: string[]
  userRoles?: UserRoles | null
}

// Search filters
export interface SearchFilters {
  visibility?: Enums<'visibility_options'>[]
  hasChart?: boolean
  hasTable?: boolean
  hasDiagram?: boolean
  hasImage?: boolean
  hasVideo?: boolean
  hasAudio?: boolean
  tags?: string[]
  dateRange?: {
    from: string
    to: string
  }
}

// Search result metadata
export interface SearchMetadata {
  totalResults: number
  searchTime: number
  query: string
  appliedFilters: SearchFilters
}
