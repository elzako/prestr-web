/**
 * File Service
 *
 * Handles file-related data fetching operations.
 * Automatically handles E2E test mode internally.
 */

import { createClient } from '@/lib/supabase/server'

/**
 * Get file info for WOPI operations
 * Returns a formatted string with organization, file ID, object ID, and file type
 *
 * @param orgId - The organization ID
 * @param parentId - The parent folder ID
 * @param fileId - The file name with extension
 * @returns Formatted file info string for WOPI
 */
export async function getFileInfo(
  orgId: string,
  parentId: string,
  fileId: string,
): Promise<string | null> {
  const supabase = await createClient()

  const dotIndex = fileId.indexOf('.')
  if (dotIndex === -1) {
    console.error('Invalid file ID format:', fileId)
    return null
  }

  const fileName = fileId.substring(0, dotIndex)
  const fileType = fileId.substring(dotIndex + 1).toLowerCase()

  const { data: file, error } = await supabase
    .from('files')
    .select('id, object_id, file_type')
    .eq('parent_id', parentId)
    .eq('file_name', fileName)
    .eq('file_type', fileType)
    .single()

  if (error || !file) {
    console.error('Error fetching file:', error)
    return null
  }

  return `${orgId}~${file.id}~${file.object_id}.${file.file_type}`
}
