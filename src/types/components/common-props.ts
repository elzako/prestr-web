import type { ReactNode } from 'react'
import type { Organization, UserRoles } from '../entities'

/**
 * Common component props patterns
 *
 * These types define reusable prop patterns that appear across multiple
 * components, reducing duplication and improving consistency.
 */

// Base props for components that need organization context
export interface WithOrganization {
  organization: Organization
  organizationName: string
  organizationId?: string
}

// Base props for components that need user roles
export interface WithUserRoles {
  userRoles?: UserRoles | null
}

// Base props for modal components
export interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
}

// Base props for components with loading states
export interface WithLoadingState {
  loading?: boolean
}

// Base props for components with error states
export interface WithErrorState {
  error?: string | null
}

// Combined loading and error state
export interface WithAsyncState extends WithLoadingState, WithErrorState {}

// Base props for list components
export interface BaseListProps<T> {
  items: T[]
  loading?: boolean
  error?: string | null
  emptyMessage?: string
}

// Base props for components with breadcrumb navigation
export interface WithBreadcrumbs {
  currentPath: string
  folderPath?: string
}

// Base props for components that handle success callbacks
export interface WithSuccessCallback {
  onSuccess?: () => void
}

// Base props for components with confirmation dialogs
export interface WithConfirmation {
  confirmTitle?: string
  confirmMessage?: string
  onConfirm: () => void
}

// Common action button props
export interface ActionButtonProps {
  label: string
  onClick: () => void
  variant?: 'default' | 'danger' | 'success'
  disabled?: boolean
  loading?: boolean
}
