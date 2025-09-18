import type { BaseFormData, BaseModalFormProps } from './base'

/**
 * Folder-related form types
 *
 * These types define the form data structures and component props
 * for folder creation and editing operations.
 */

// Folder creation form data (no tags field)
export interface CreateFolderFormData extends BaseFormData {
  // Inherits: folderName, description, visibility
}

// Folder editing form data (same structure as create)
export interface EditFolderFormData extends BaseFormData {
  // Inherits: folderName, description, visibility
}

// Create folder modal props
export interface CreateFolderModalProps extends BaseModalFormProps {
  parentFolderId: string
}

// Edit folder modal props
export interface EditFolderModalProps extends BaseModalFormProps {
  folderId: string
}

// Folder form validation rules
export interface FolderFormValidation {
  folderName: {
    required: boolean
    minLength: number
    maxLength: number
    pattern?: RegExp
  }
  description: {
    maxLength: number
  }
}
