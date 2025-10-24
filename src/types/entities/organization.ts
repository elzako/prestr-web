import type { Tables } from '@/types/database.types'
/**
 * Organization entity types
 *
 * These types provide consistent, reusable definitions for organization-related data
 * across the application. They use Pick<> to select only the fields needed for
 * specific use cases, reducing payload size and improving type safety.
 */

// Base organization type with core fields
export type Organization = Pick<
  Tables<'organizations'>,
  'id' | 'organization_name' | 'metadata' | 'tags'
>

// Minimal organization type for lists and references
export type OrganizationSummary = Pick<
  Tables<'organizations'>,
  'id' | 'organization_name'
>

// Extended organization type with all commonly used fields
export type OrganizationDetail = Pick<
  Tables<'organizations'>,
  'id' | 'organization_name' | 'metadata' | 'tags' | 'created_at' | 'updated_at'
>

// Organization metadata type helper
export interface OrganizationMetadata {
  name?: string
  about?: string
  website?: string
  location?: string
  profilePicture?: string | null
  displayMembers?: boolean
}
