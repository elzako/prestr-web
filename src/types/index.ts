/**
 * Types main barrel export
 *
 * This file provides a single import point for all commonly used types
 * across the application. It re-exports types from different domains
 * to improve developer experience and maintain clean import statements.
 *
 * Usage examples:
 * import { Organization, Project, UserRoles } from '@/types'
 * import { SearchResult, UploadState } from '@/types'
 * import { CreateProjectFormData, ActionItem } from '@/types'
 */

// Database types (direct export for convenience)
export type { Database, Tables, Enums } from './database.types'

// Entity types (most commonly used)
export type {
  Organization,
  OrganizationSummary,
  OrganizationDetail,
  Project,
  ProjectSummary,
  ProjectInsert,
  ProjectUpdate,
  Folder,
  FolderDetail,
  FolderInsert,
  FolderUpdate,
  FolderContent,
  Presentation,
  PresentationDetail,
  Slide,
  SlideDetail,
  SlideForEditing,
  UserRoles,
  AuthUser,
  UserProfile,
} from './entities'

// Form types (commonly used in components)
export type {
  BaseFormData,
  CreateProjectFormData,
  EditProjectFormData,
  CreateFolderFormData,
  EditFolderFormData,
  CreateProjectModalProps,
  EditProjectModalProps,
  CreateFolderModalProps,
  EditFolderModalProps,
  CreatePresentationFormData,
  CreatePresentationViewProps,
  EditPresentationFormData,
  EditPresentationModalProps,
  PresentationUpdateResult,
  FormState,
  BaseModalFormProps,
  OrganizationProfileFormData,
  OrganizationMetadata,
  OrganizationUpdateData,
} from './forms'

// API types (commonly used in data fetching)
export type {
  SearchResult,
  SearchOptions,
  TypesenseSlideResult,
  TypesenseSearchResponse,
  UploadState,
  UploadProgress,
  UploadResult,
  PowerPointUploadProps,
  UploadModalProps,
} from './api'

// Component types (commonly used props)
export type {
  ActionItem,
  ActionDropdownProps,
  ConfirmDialogProps,
  ActionStates,
  ProjectListProps,
  FolderViewProps,
  FolderContentListProps,
  PresentationViewProps,
  SlideViewProps,
  DraftReviewModalProps,
  SearchResultsProps,
  BreadcrumbsProps,
  OrgHeaderProps,
  AuthHeaderProps,
  WithOrganization,
  WithUserRoles,
  BaseModalProps,
  WithAsyncState,
} from './components'

// Re-export all types for specific domain imports
export * as Entities from './entities'
export * as Forms from './forms'
export * as API from './api'
export * as Components from './components'
