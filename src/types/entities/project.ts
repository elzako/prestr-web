import type {
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
} from '@/types/database.types'

/**
 * Project and Folder entity types
 *
 * Note: In the database schema, projects are stored in the 'folders' table
 * with a parent_id of null to distinguish them from subfolders.
 */

/**
 * Base project type (projects are top-level folders)
 *
 * Projects are stored in the 'folders' table with parent_id = null.
 * This type includes all commonly used fields for project operations.
 */
export type Project = Pick<
  Tables<'folders'>,
  | 'id'
  | 'organization_id'
  | 'parent_id'
  | 'folder_name'
  | 'full_path'
  | 'tags'
  | 'visibility'
  | 'metadata'
  | 'created_at'
  | 'updated_at'
  | 'deleted_at'
>

// Minimal project type for lists
export type ProjectSummary = Pick<
  Tables<'folders'>,
  'id' | 'folder_name' | 'visibility'
>

// Base folder type (subfolders within projects)
export type Folder = Pick<
  Tables<'folders'>,
  | 'id'
  | 'organization_id'
  | 'parent_id'
  | 'folder_name'
  | 'full_path'
  | 'tags'
  | 'visibility'
  | 'metadata'
  | 'created_at'
  | 'updated_at'
  | 'deleted_at'
>

// Detailed folder type with timestamps
export type FolderDetail = Pick<
  Tables<'folders'>,
  | 'id'
  | 'folder_name'
  | 'full_path'
  | 'tags'
  | 'visibility'
  | 'metadata'
  | 'created_at'
  | 'updated_at'
  | 'parent_id'
>

// Database operation types for projects
export type ProjectInsert = TablesInsert<'folders'>
export type ProjectUpdate = TablesUpdate<'folders'>

// Database operation types for folders
export type FolderInsert = TablesInsert<'folders'>
export type FolderUpdate = TablesUpdate<'folders'>

/**
 * Shared content container interface
 *
 * Used to represent the contents of a folder, including subfolders,
 * presentations, and individual slides. This is the primary data structure
 * for folder views and content lists.
 */
export interface FolderContent {
  folders: Folder[]
  presentations: Presentation[]
  slides: Slide[]
}

// Import presentation and slide types (avoiding circular dependency)
type Presentation = Pick<
  Tables<'presentations'>,
  | 'id'
  | 'parent_id'
  | 'file_name'
  | 'metadata'
  | 'tags'
  | 'created_at'
  | 'updated_at'
  | 'deleted_at'
>

type Slide = Pick<
  Tables<'slides'>,
  | 'id'
  | 'object_id'
  | 'parent_id'
  | 'file_name'
  | 'metadata'
  | 'tags'
  | 'created_at'
  | 'updated_at'
  | 'deleted_at'
>
