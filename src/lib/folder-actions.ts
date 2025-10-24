'use server'

import { createClient } from '@/lib/supabase/server'
import type { Enums, FolderInsert, FolderUpdate } from '@/types'
import { revalidatePath } from 'next/cache'

// Helper function to get current user
async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('User not authenticated')
  }

  return user
}

// Helper function to check user permissions in organization
async function checkUserPermissions(organizationId: string, userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_organization_roles')
    .select('user_role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()

  if (error) {
    throw new Error('Failed to check user permissions')
  }

  return data.user_role
}

// Get organization by name
async function getOrganizationByName(organizationName: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organizations')
    .select('id, organization_name')
    .eq('organization_name', organizationName)
    .single()

  if (error) {
    throw new Error('Organization not found')
  }

  return data
}

// Helper function to validate folder name
function validateFolderName(folderName: string): string | null {
  if (!folderName.trim()) {
    return 'Folder name is required'
  }

  // Check if folder name only contains lowercase letters, numbers, and hyphens
  const validPattern = /^[a-z0-9-]+$/
  if (!validPattern.test(folderName)) {
    return 'Folder name can only contain lowercase letters, numbers, and hyphens'
  }

  if (folderName.length < 2) {
    return 'Folder name must be at least 2 characters long'
  }

  if (folderName.length > 50) {
    return 'Folder name must be less than 50 characters'
  }

  if (folderName.startsWith('-') || folderName.endsWith('-')) {
    return 'Folder name cannot start or end with a hyphen'
  }

  return null
}

// Helper function to check if folder has children
async function hasChildren(folderId: string): Promise<boolean> {
  const supabase = await createClient()

  // Check for child folders
  const { data: childFolders } = await supabase
    .from('folders')
    .select('id')
    .eq('parent_id', folderId)
    .is('deleted_at', null)
    .limit(1)

  if (childFolders && childFolders.length > 0) {
    return true
  }

  // Check for presentations
  const { data: presentations } = await supabase
    .from('presentations')
    .select('id')
    .eq('parent_id', folderId)
    .is('deleted_at', null)
    .limit(1)

  if (presentations && presentations.length > 0) {
    return true
  }

  // Check for slides
  const { data: slides } = await supabase
    .from('slides')
    .select('id')
    .eq('parent_id', folderId)
    .is('deleted_at', null)
    .limit(1)

  if (slides && slides.length > 0) {
    return true
  }

  return false
}

// Helper function to construct full path
function constructFullPath(
  parentPath: string | null,
  folderName: string,
): string {
  if (!parentPath || parentPath === '/') {
    return `/${folderName}`
  }
  return `${parentPath}/${folderName}`
}

// Get folder by ID
export async function getFolderById(folderId: string) {
  try {
    const supabase = await createClient()

    const { data: folder, error } = await supabase
      .from('folders')
      .select('*')
      .eq('id', folderId)
      .is('deleted_at', null)
      .single()

    if (error) {
      throw new Error(`Failed to fetch folder: ${error.message}`)
    }

    return { success: true, folder }
  } catch (error) {
    console.error('Get folder error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch folder',
      folder: null,
    }
  }
}

// Create a new folder
export async function createFolder(
  organizationName: string,
  parentFolderId: string,
  folderData: {
    folderName: string
    description?: string
    visibility?: Enums<'visibility_options'>
  },
) {
  try {
    const user = await getCurrentUser()
    const organization = await getOrganizationByName(organizationName)

    // Validate folder name
    const nameError = validateFolderName(folderData.folderName)
    if (nameError) {
      throw new Error(nameError)
    }

    // Check permissions (owner/admin/member can create folders)
    const userRole = await checkUserPermissions(organization.id, user.id)
    if (!['owner', 'admin', 'member'].includes(userRole!)) {
      throw new Error('Insufficient permissions to create folders')
    }

    const supabase = await createClient()

    // Get parent folder to validate and construct path
    const { data: parentFolder, error: parentError } = await supabase
      .from('folders')
      .select('*')
      .eq('id', parentFolderId)
      .eq('organization_id', organization.id)
      .is('deleted_at', null)
      .single()

    if (parentError || !parentFolder) {
      throw new Error('Parent folder not found')
    }

    // Check if folder name already exists in parent folder
    const { data: existingFolder } = await supabase
      .from('folders')
      .select('id')
      .eq('organization_id', organization.id)
      .eq('parent_id', parentFolderId)
      .eq('folder_name', folderData.folderName)
      .is('deleted_at', null)
      .single()

    if (existingFolder) {
      throw new Error('A folder with this name already exists in this location')
    }

    // Construct full path
    const fullPath = constructFullPath(
      parentFolder.full_path,
      folderData.folderName,
    )

    // Determine visibility (inherit from parent if not specified)
    const visibility =
      folderData.visibility || parentFolder.visibility || 'internal'

    // Create the folder
    const folderInsert: FolderInsert = {
      folder_name: folderData.folderName,
      organization_id: organization.id,
      parent_id: parentFolderId,
      full_path: fullPath,
      created_by: user.id,
      updated_by: user.id,
      metadata: folderData.description
        ? { description: folderData.description }
        : undefined,
      visibility,
      tags: [],
    }

    const { data: folder, error } = await supabase
      .from('folders')
      .insert(folderInsert)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create folder: ${error.message}`)
    }

    // Revalidate relevant paths
    revalidatePath(`/${organizationName}`)
    if (parentFolder.full_path) {
      revalidatePath(`/${organizationName}${parentFolder.full_path}`)
    }

    return { success: true, folder }
  } catch (error) {
    console.error('Create folder error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create folder',
    }
  }
}

// Update an existing folder
export async function updateFolder(
  organizationName: string,
  folderId: string,
  updateData: {
    folderName?: string
    description?: string
    visibility?: Enums<'visibility_options'>
  },
) {
  try {
    const user = await getCurrentUser()
    const organization = await getOrganizationByName(organizationName)

    // Validate folder name if provided
    if (updateData.folderName) {
      const nameError = validateFolderName(updateData.folderName)
      if (nameError) {
        throw new Error(nameError)
      }
    }

    // Check permissions (owner/admin/member can update folders)
    const userRole = await checkUserPermissions(organization.id, user.id)
    if (!['owner', 'admin', 'member'].includes(userRole!)) {
      throw new Error('Insufficient permissions to update folders')
    }

    const supabase = await createClient()

    // Get current folder to verify it exists and belongs to this organization
    const { data: currentFolder, error: fetchError } = await supabase
      .from('folders')
      .select('*')
      .eq('id', folderId)
      .eq('organization_id', organization.id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !currentFolder) {
      throw new Error('Folder not found')
    }

    // Check for name conflicts if name is being changed
    if (
      updateData.folderName &&
      updateData.folderName !== currentFolder.folder_name
    ) {
      let query = supabase
        .from('folders')
        .select('id')
        .eq('organization_id', organization.id)
        .eq('folder_name', updateData.folderName)
        .is('deleted_at', null)
        .neq('id', folderId)

      // Handle parent_id which can be null
      if (currentFolder.parent_id === null) {
        query = query.is('parent_id', null)
      } else {
        query = query.eq('parent_id', currentFolder.parent_id)
      }

      const { data: existingFolder } = await query.single()

      if (existingFolder) {
        throw new Error(
          'A folder with this name already exists in this location',
        )
      }
    }

    // Prepare update data
    const folderUpdate: FolderUpdate = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }

    let newFullPath = currentFolder.full_path

    if (updateData.folderName) {
      folderUpdate.folder_name = updateData.folderName

      // Update full path if name changed
      if (updateData.folderName !== currentFolder.folder_name) {
        const parentPath =
          currentFolder.full_path?.split('/').slice(0, -1).join('/') || ''
        newFullPath = constructFullPath(
          parentPath || null,
          updateData.folderName,
        )
        folderUpdate.full_path = newFullPath
      }
    }

    if (updateData.description !== undefined) {
      folderUpdate.metadata = {
        description: updateData.description || undefined,
      }
    }

    if (updateData.visibility) {
      folderUpdate.visibility = updateData.visibility
    }

    // Update the folder
    const { data: folder, error } = await supabase
      .from('folders')
      .update(folderUpdate)
      .eq('id', folderId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update folder: ${error.message}`)
    }

    // TODO: If the folder name changed, we should update the full_path of all children
    // This would require a recursive update of all descendant folders
    // For now, we'll handle this limitation in the UI by refreshing

    // Revalidate relevant paths
    revalidatePath(`/${organizationName}`)
    if (currentFolder.full_path) {
      revalidatePath(`/${organizationName}${currentFolder.full_path}`)
    }
    if (newFullPath && newFullPath !== currentFolder.full_path) {
      revalidatePath(`/${organizationName}${newFullPath}`)
    }

    return { success: true, folder }
  } catch (error) {
    console.error('Update folder error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update folder',
    }
  }
}

// Delete a folder (soft delete)
export async function deleteFolder(organizationName: string, folderId: string) {
  try {
    const user = await getCurrentUser()
    const organization = await getOrganizationByName(organizationName)

    // Check permissions (owner/admin can delete folders)
    const userRole = await checkUserPermissions(organization.id, user.id)
    if (!['owner', 'admin'].includes(userRole!)) {
      throw new Error('Insufficient permissions to delete folders')
    }

    const supabase = await createClient()

    // Verify folder exists and belongs to this organization
    const { data: folder, error: fetchError } = await supabase
      .from('folders')
      .select('id, folder_name, full_path')
      .eq('id', folderId)
      .eq('organization_id', organization.id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !folder) {
      throw new Error('Folder not found')
    }

    // Check if folder has children (folders, presentations, or slides)
    const hasChildContent = await hasChildren(folderId)
    if (hasChildContent) {
      throw new Error(
        'Cannot delete folder that contains subfolders, presentations, or slides',
      )
    }

    // Soft delete the folder
    const { error } = await supabase
      .from('folders')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', folderId)

    if (error) {
      throw new Error(`Failed to delete folder: ${error.message}`)
    }

    // Revalidate relevant paths
    revalidatePath(`/${organizationName}`)
    if (folder.full_path) {
      const parentPath = folder.full_path.split('/').slice(0, -1).join('/')
      revalidatePath(`/${organizationName}${parentPath || '/'}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Delete folder error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete folder',
    }
  }
}

// Get folder path segments for breadcrumb navigation
export async function getFolderBreadcrumbs(
  organizationId: string,
  folderId: string,
) {
  try {
    const supabase = await createClient()

    // Get the folder
    const { data: folder, error } = await supabase
      .from('folders')
      .select('id, folder_name, full_path, parent_id')
      .eq('id', folderId)
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .single()

    if (error || !folder) {
      throw new Error('Folder not found')
    }

    // Parse the full path to create breadcrumbs
    const breadcrumbs = []
    if (folder.full_path) {
      const pathSegments = folder.full_path.split('/').filter(Boolean)
      let currentPath = ''

      for (const segment of pathSegments) {
        currentPath += `/${segment}`
        breadcrumbs.push({
          name: segment,
          path: currentPath,
        })
      }
    }

    return { success: true, breadcrumbs }
  } catch (error) {
    console.error('Get breadcrumbs error:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to get breadcrumbs',
      breadcrumbs: [],
    }
  }
}
