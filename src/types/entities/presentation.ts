import type { Tables } from '../database.types'

/**
 * Presentation entity types
 *
 * These types define the various presentation-related data structures
 * used throughout the application.
 */

// Base presentation type for lists and references
export type Presentation = Pick<
  Tables<'presentations'>,
  'id' | 'presentation_name' | 'metadata' | 'created_at'
>

// Extended presentation type with additional fields
export type PresentationSummary = Pick<
  Tables<'presentations'>,
  'id' | 'presentation_name' | 'metadata' | 'created_at' | 'tags' | 'settings'
>

// Detailed presentation type with all commonly used fields
export type PresentationDetail = Pick<
  Tables<'presentations'>,
  | 'id'
  | 'parent_id'
  | 'presentation_name'
  | 'metadata'
  | 'created_at'
  | 'updated_at'
  | 'tags'
  | 'slides'
  | 'settings'
  | 'version'
>

// Full presentation type for comprehensive operations
export type PresentationFull = Pick<
  Tables<'presentations'>,
  | 'id'
  | 'presentation_name'
  | 'metadata'
  | 'created_at'
  | 'updated_at'
  | 'tags'
  | 'slides'
  | 'settings'
  | 'version'
  | 'parent_id'
>

// Presentation metadata type helper
export interface PresentationMetadata {
  url?: string
  description?: string
  thumbnailUrl?: string
  slideCount?: number
  fileSize?: number
  originalFileName?: string
}
