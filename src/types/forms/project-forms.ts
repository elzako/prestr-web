import type { BaseFormData, BaseModalFormProps } from './base'
import type { Project } from '../entities'

/**
 * Project-related form types
 *
 * These types define the form data structures and component props
 * for project creation and editing operations.
 */

// Project creation form data
export interface CreateProjectFormData extends BaseFormData {
  tags: string
}

// Project editing form data (same structure as create)
export interface EditProjectFormData extends BaseFormData {
  tags: string
}

// Create project modal props
export interface CreateProjectModalProps extends BaseModalFormProps {
  // No additional props needed beyond base
}

// Edit project modal props
export interface EditProjectModalProps extends BaseModalFormProps {
  project: Project | null
}

// Project form validation rules
export interface ProjectFormValidation {
  folderName: {
    required: boolean
    minLength: number
    maxLength: number
    pattern?: RegExp
  }
  description: {
    maxLength: number
  }
  tags: {
    maxLength: number
    separator: string
  }
}
