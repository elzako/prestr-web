import type { Enums } from '../database.types'

/**
 * Base form types and utilities
 *
 * These types provide common form patterns and utilities used across
 * different form components in the application.
 */

// Common form field types
export type VisibilityOption = Enums<'visibility_options'>

// Base form data interface with common fields
export interface BaseFormData {
  folderName: string
  description: string
  visibility: VisibilityOption
}

// Form state management
export interface FormState<T = any> {
  data: T
  loading: boolean
  error: string | null
}

// Form validation result
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

// Form submission result
export interface FormSubmissionResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

// Common form props pattern
export interface BaseModalFormProps {
  isOpen: boolean
  onClose: () => void
  organizationName: string
  onSuccess?: () => void
}
