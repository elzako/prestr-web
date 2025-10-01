import type { BaseModalFormProps, FormSubmissionResult } from './base'
import type { PresentationDetail } from '../entities'

/**
 * Presentation form types
 *
 * These types define the structure for presentation editing forms
 * and their associated props and validation.
 */

// Form data for editing presentation metadata
export interface EditPresentationFormData {
  presentation_name: string
  tags: string
}

// Props for edit presentation modal
export interface EditPresentationModalProps extends BaseModalFormProps {
  presentation: PresentationDetail
  folderPath: string
  onNameChange?: (oldName: string, newName: string) => void
}

// Validation schema for presentation forms
export interface PresentationFormValidation {
  presentation_name: {
    required: string
    pattern: {
      value: RegExp
      message: string
    }
  }
  tags: {
    validate: {
      maxTags: (value: string) => boolean | string
    }
  }
}

// Form submission result with redirect info
export interface PresentationUpdateResult extends FormSubmissionResult {
  nameChanged?: boolean
  newName?: string
}
