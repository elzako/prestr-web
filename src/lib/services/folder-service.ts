/**
 * Folder Service
 *
 * Handles folder-related data fetching operations.
 * Automatically handles E2E test mode internally.
 */

import { createClient } from '@/lib/supabase/server'
import { isE2ETestMode } from '@/lib/e2e/test-mode'
import {
  findFolderIdByPath,
  getRootFolderId as getTestRootFolderId,
  getSubFolderIds as getTestSubFolderIds,
  getFolderContent as getTestFolderContent,
} from '@/lib/e2e/testStore'
import type { FolderContent } from '@/types'

/**
 * Get folder ID by its full path within an organization
 *
 * @param organizationId - The organization ID
 * @param currentPath - The folder path (e.g., 'project1/folder1')
 * @returns Folder ID or null if not found
 */
export async function getFolderId(
  organizationId: string,
  currentPath: string,
): Promise<string | null> {
  if (isE2ETestMode()) {
    return findFolderIdByPath(organizationId, currentPath)
  }

  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_folder_id_by_full_path', {
    org_id: organizationId,
    current_path: currentPath.startsWith('/') ? currentPath : '/' + currentPath,
  })

  if (error) {
    console.error('Error fetching folder ID:', error)
    return null
  }

  return data
}

/**
 * Get the root folder ID (project ID) for a given folder
 *
 * @param folderId - The folder ID to find the root for
 * @returns Root folder ID or null if not found
 */
export async function getRootFolderId(
  folderId: string,
): Promise<string | null> {
  if (isE2ETestMode()) {
    return getTestRootFolderId(folderId)
  }

  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_root_folder_id', {
    folder_id: folderId,
  })

  if (error) {
    console.error('Error fetching root folder ID:', error)
    return null
  }

  return data
}

/**
 * Get all subfolder IDs including the folder itself
 *
 * @param folderId - The folder ID
 * @returns Array of folder IDs or empty array if error
 */
export async function getSubFolderIds(
  folderId: string,
): Promise<string[] | null> {
  if (isE2ETestMode()) {
    return getTestSubFolderIds(folderId)
  }

  const supabase = await createClient()

  const { data, error } = await supabase.rpc(
    'get_subfolder_ids_including_self',
    {
      p_folder_id: folderId,
    },
  )

  if (error) {
    console.error('Error fetching sub folder IDs:', error)
    return []
  }

  return data
}

/**
 * Get folder content (subfolders, presentations, slides, files)
 *
 * @param folderId - The folder ID
 * @returns Folder content object with arrays of folders, presentations, slides, and files
 */
export async function getFolderContent(
  folderId: string,
): Promise<FolderContent> {
  if (isE2ETestMode()) {
    return getTestFolderContent(folderId)
  }

  const supabase = await createClient()

  const { data: folders, error: foldersError } = await supabase
    .from('folders')
    .select(
      'id, organization_id, parent_id, folder_name, full_path, tags, visibility, metadata, created_at, updated_at, deleted_at',
    )
    .eq('parent_id', folderId)
    .is('deleted_at', null)
    .order('folder_name', { ascending: true })

  const { data: presentations, error: presentationsError } = await supabase
    .from('presentations')
    .select(
      'id, parent_id, file_name, metadata, created_at, updated_at, deleted_at, tags, settings',
    )
    .eq('parent_id', folderId)
    .is('deleted_at', null)
    .order('file_name', { ascending: true })

  const { data: slides, error: slidesError } = await supabase
    .from('slides')
    .select(
      'id, object_id, parent_id, file_name, metadata, tags, created_at, updated_at, deleted_at',
    )
    .eq('parent_id', folderId)
    .is('deleted_at', null)
    .order('file_name', { ascending: true })

  const { data: files, error: filesError } = await supabase
    .from('files')
    .select('id, object_id, parent_id, file_name, file_type')
    .eq('parent_id', folderId)
    .is('deleted_at', null)
    .order('file_name', { ascending: true })

  if (foldersError) {
    console.error('Error fetching folders:', foldersError)
  }

  if (presentationsError) {
    console.error('Error fetching presentations:', presentationsError)
  }

  if (slidesError) {
    console.error('Error fetching slides:', slidesError)
  }

  if (filesError) {
    console.error('Error fetching files:', filesError)
  }

  return {
    folders: folders || [],
    presentations: presentations || [],
    slides: slides || [],
    files: files || [],
  }
}
