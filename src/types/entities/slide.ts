import type { Tables } from '@/types/database.types'

/**
 * Slide entity types
 *
 * These types define the various slide-related data structures
 * used throughout the application.
 */

// Base slide type for lists and references
export type Slide = Pick<
  Tables<'slides'>,
  | 'id'
  | 'object_id'
  | 'parent_id'
  | 'file_name'
  | 'metadata'
  | 'tags'
  | 'created_at'
  | 'updated_at'
  | 'deleted_at'
>

// Extended slide type with additional fields
export type SlideSummary = Pick<
  Tables<'slides'>,
  'id' | 'file_name' | 'metadata' | 'created_at' | 'tags' | 'object_id'
>

// Detailed slide type with all commonly used fields
export type SlideDetail = Pick<
  Tables<'slides'>,
  | 'id'
  | 'parent_id'
  | 'file_name'
  | 'metadata'
  | 'created_at'
  | 'updated_at'
  | 'object_id'
  | 'tags'
  | 'visibility'
  | 'description'
>

// Slide type for editing with required fields
export type SlideForEditing = Pick<
  Tables<'slides'>,
  'id' | 'file_name' | 'description' | 'tags'
>

// Full slide type for comprehensive operations
export type SlideFull = Pick<
  Tables<'slides'>,
  | 'id'
  | 'file_name'
  | 'metadata'
  | 'created_at'
  | 'updated_at'
  | 'object_id'
  | 'tags'
  | 'parent_id'
>

// Slide metadata type helper
export interface SlideMetadata {
  textContent?: string[]
  imageUrl?: string
  thumbnailUrl?: string
  slideNumber?: number
  hasAnimations?: boolean
  layoutType?: string
}
