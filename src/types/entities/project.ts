import type {
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
} from '../database.types'

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
  | 'folder_name'
  | 'full_path'
  | 'tags'
  | 'visibility'
  | 'metadata'
  | 'created_at'
  | 'updated_at'
>

// Minimal project type for lists
export type ProjectSummary = Pick<
  Tables<'folders'>,
  'id' | 'folder_name' | 'visibility'
>

// Base folder type (subfolders within projects)
export type Folder = Pick<
  Tables<'folders'>,
  'id' | 'folder_name' | 'full_path' | 'tags' | 'visibility'
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
  'id' | 'presentation_name' | 'metadata' | 'created_at'
>

type Slide = Pick<
  Tables<'slides'>,
  'id' | 'slide_name' | 'metadata' | 'created_at'
>
