/**
 * Organization profile form types
 *
 * These types define the form data structure for updating organization profiles.
 */

// Organization profile form data
export interface OrganizationProfileFormData {
  // Maps to metadata column
  name: string
  about: string
  website: string
  location: string

  // Maps to organization_name column
  organization_name: string
}

// Organization metadata type for database operations
export interface OrganizationMetadata {
  name?: string
  about?: string
  website?: string
  location?: string
  profilePicture?: string
  displayMembers?: boolean
}

// Organization update data for Supabase
export interface OrganizationUpdateData {
  organization_name?: string
  metadata?: OrganizationMetadata
  updated_at?: string
  updated_by: string
}
