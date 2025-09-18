/**
 * User and authentication-related types
 *
 * These types define user data structures, roles, and authentication states
 * used throughout the application.
 */

/**
 * User roles interface (moved from page component)
 *
 * Represents the roles a user has within an organization and specific folders.
 * Used for role-based access control throughout the application.
 *
 * @example
 * ```typescript
 * const userRoles: UserRoles = {
 *   organizationRoles: ['admin', 'member'],
 *   folderRoles: [
 *     { folder_id: 'folder-123', user_role: 'contributor' },
 *     { folder_id: 'folder-456', user_role: 'admin' }
 *   ]
 * }
 * ```
 */
export interface UserRoles {
  organizationRoles: string[]
  folderRoles: { folder_id: string; user_role: string }[]
}

// Auth header user type
export interface AuthUser {
  email?: string
  user_metadata?: {
    full_name?: string
  }
}

// Extended user profile type
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  organization_id?: string
}

// User session state
export interface UserSession {
  user: AuthUser
  userProfile?: UserProfile
  userRoles?: UserRoles
}

// User permission helpers
export type OrganizationRole = 'owner' | 'admin' | 'member'
export type FolderRole = 'admin' | 'contributor' | 'member'
export type PresentationRole =
  | 'project-admin'
  | 'project-contributor'
  | 'project-member'
  | 'organization-member'
  | 'public'
