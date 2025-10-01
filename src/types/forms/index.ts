/**
 * Forms types barrel export
 *
 * This file provides a single import point for all form-related types,
 * improving developer experience and maintaining clean import statements.
 */

// Base form types
export type {
  VisibilityOption,
  BaseFormData,
  FormState,
  ValidationResult,
  FormSubmissionResult,
  BaseModalFormProps,
} from './base'

// Project form types
export type {
  CreateProjectFormData,
  EditProjectFormData,
  CreateProjectModalProps,
  EditProjectModalProps,
  ProjectFormValidation,
} from './project-forms'

// Folder form types
export type {
  CreateFolderFormData,
  EditFolderFormData,
  CreateFolderModalProps,
  EditFolderModalProps,
  FolderFormValidation,
} from './folder-forms'

// Presentation form types
export type {
  EditPresentationFormData,
  EditPresentationModalProps,
  PresentationFormValidation,
  PresentationUpdateResult,
} from './presentation-forms'

// Organization profile form types
export type {
  OrganizationProfileFormData,
  OrganizationMetadata,
  OrganizationUpdateData,
} from './organization-profile'
