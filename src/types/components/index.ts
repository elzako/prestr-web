/**
 * Component types barrel export
 *
 * This file provides a single import point for all component-related types,
 * improving developer experience and maintaining clean import statements.
 */

// Common component props patterns
export type {
  WithOrganization,
  WithUserRoles,
  BaseModalProps,
  WithLoadingState,
  WithErrorState,
  WithAsyncState,
  BaseListProps,
  WithBreadcrumbs,
  WithSuccessCallback,
  WithConfirmation,
  ActionButtonProps,
} from './common-props'

// Action-related types
export type {
  ActionItem,
  ActionDropdownProps,
  ConfirmDialogProps,
  ActionStates,
  BulkActionItem,
  BulkActions,
} from './action-types'

// View component props
export type {
  ProjectListProps,
  FolderViewProps,
  FolderContentListProps,
  PresentationViewProps,
  SlideViewProps,
  SearchResultsProps,
  BreadcrumbsProps,
  OrgHeaderProps,
  AuthHeaderProps,
} from './view-props'
