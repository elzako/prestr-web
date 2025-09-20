import type {
  FolderContent,
  Organization,
  PresentationDetail,
  Project,
  SlideDetail,
  UserRoles,
} from '../entities'

/**
 * View component props
 *
 * These types define the props for major view components that display
 * different types of content (projects, folders, presentations, slides).
 */

// Project list view props
export interface ProjectListProps {
  projects: Project[]
  organizationName: string
  organizationId?: string
  userRoles?: UserRoles | null
}

// Folder view props
export interface FolderViewProps {
  organization: Organization
  folderId: string
  folderPath: string
  content: FolderContent
  projectId: string | null
  subFolderIds: string[] | null
  userRoles: UserRoles | null
}

// Folder content list props
export interface FolderContentListProps {
  content: FolderContent
  organizationName: string
  currentFolderPath: string
  organizationId?: string
  currentFolderId?: string
  projectId?: string | null
  subFolderIds?: string[] | null
  userRoles?: UserRoles | null
}

// Presentation view props
export interface PresentationViewProps {
  presentation: PresentationDetail
  organization: Organization
  folderPath: string
}

// Slide view props
export interface SlideViewProps {
  slide: SlideDetail
  organization: Organization
  folderPath: string
}

// Search results props
export interface SearchResultsProps {
  organizationName: string
  organizationId: string
  projectId: string | null
  subFolderIds: string[] | null
  searchQuery: string
  isSearchMode: boolean
  userRoles: UserRoles | null
}

// Breadcrumbs props
export interface BreadcrumbsProps {
  organization: Organization
  currentPath: string
}

// Organization header props
export interface OrgHeaderProps {
  organization: Organization
  userRole?: string | null
}

// Auth header props
export interface AuthHeaderProps {
  user: {
    email?: string
    user_metadata?: {
      full_name?: string
    }
  }
  userProfile?: {
    id: string
    full_name?: string
    avatar_url?: string
    metadata?: {
      firstName?: string
      lastName?: string
      email?: string
    }
  }
  userOrganization?: {
    id: string
    organization_name: string
    user_role: string | null
  }
}
