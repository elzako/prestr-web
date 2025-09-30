/**
 * Entity types barrel export
 *
 * This file provides a single import point for all entity-related types,
 * improving developer experience and maintaining clean import statements.
 */

// Organization types
export type {
  Organization,
  OrganizationSummary,
  OrganizationDetail,
  OrganizationMetadata,
} from './organization'

// Project and folder types
export type {
  Project,
  ProjectSummary,
  Folder,
  FolderDetail,
  ProjectInsert,
  ProjectUpdate,
  FolderInsert,
  FolderUpdate,
  FolderContent,
} from './project'

// Presentation types
export type {
  Presentation,
  PresentationSummary,
  PresentationDetail,
  PresentationFull,
  PresentationMetadata,
} from './presentation'

// Slide types
export type {
  Slide,
  SlideSummary,
  SlideDetail,
  SlideForEditing,
  SlideFull,
  SlideMetadata,
} from './slide'

// User and auth types
export type {
  UserRoles,
  AuthUser,
  UserProfile,
  UserSession,
  OrganizationRole,
  FolderRole,
  PresentationRole,
} from './user'
