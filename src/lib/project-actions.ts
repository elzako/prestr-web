'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '../../types/database.types'

export type Project = Tables<'folders'>
export type ProjectInsert = TablesInsert<'folders'>
export type ProjectUpdate = TablesUpdate<'folders'>

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

// Create a new project
export async function createProject(
  organizationName: string,
  projectData: {
    folderName: string
    description?: string
    tags?: string[]
    visibility?: 'public' | 'private' | 'restricted'
  },
) {
  try {
    const user = await getCurrentUser()
    const organization = await getOrganizationByName(organizationName)

    // Check permissions (owner/admin can create projects)
    const userRole = await checkUserPermissions(organization.id, user.id)
    if (!['owner', 'admin'].includes(userRole!)) {
      throw new Error('Insufficient permissions to create projects')
    }

    const supabase = await createClient()

    // Check if project name already exists in this organization
    const { data: existingProject } = await supabase
      .from('folders')
      .select('id')
      .eq('organization_id', organization.id)
      .eq('folder_name', projectData.folderName)
      .is('parent_id', null)
      .single()

    if (existingProject) {
      throw new Error('A project with this name already exists')
    }

    // Create the project
    const projectInsert: ProjectInsert = {
      folder_name: projectData.folderName,
      organization_id: organization.id,
      parent_id: null, // Top-level project
      created_by: user.id,
      updated_by: user.id,
      metadata: projectData.description
        ? { description: projectData.description }
        : undefined,
      tags: projectData.tags || [],
      visibility: projectData.visibility || 'private',
    }

    const { data: project, error } = await supabase
      .from('folders')
      .insert(projectInsert)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`)
    }

    // Revalidate the organization page
    revalidatePath(`/${organizationName}`)

    return { success: true, project }
  } catch (error) {
    console.error('Create project error:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create project',
    }
  }
}

// Update an existing project
export async function updateProject(
  organizationName: string,
  projectId: string,
  updateData: {
    folderName?: string
    description?: string
    tags?: string[]
    visibility?: 'public' | 'private' | 'restricted'
  },
) {
  try {
    const user = await getCurrentUser()
    const organization = await getOrganizationByName(organizationName)

    // Check permissions (owner/admin can update projects)
    const userRole = await checkUserPermissions(organization.id, user.id)
    if (!['owner', 'admin'].includes(userRole!)) {
      throw new Error('Insufficient permissions to update projects')
    }

    const supabase = await createClient()

    // Get current project to verify it exists and belongs to this organization
    const { data: currentProject, error: fetchError } = await supabase
      .from('folders')
      .select('*')
      .eq('id', projectId)
      .eq('organization_id', organization.id)
      .is('parent_id', null)
      .single()

    if (fetchError || !currentProject) {
      throw new Error('Project not found')
    }

    // Check for name conflicts if name is being changed
    if (
      updateData.folderName &&
      updateData.folderName !== currentProject.folder_name
    ) {
      const { data: existingProject } = await supabase
        .from('folders')
        .select('id')
        .eq('organization_id', organization.id)
        .eq('folder_name', updateData.folderName)
        .is('parent_id', null)
        .neq('id', projectId)
        .single()

      if (existingProject) {
        throw new Error('A project with this name already exists')
      }
    }

    // Prepare update data
    const projectUpdate: ProjectUpdate = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }

    if (updateData.folderName) {
      projectUpdate.folder_name = updateData.folderName
    }

    if (updateData.description !== undefined) {
      projectUpdate.metadata = {
        ...currentProject.metadata,
        description: updateData.description || undefined,
      }
    }

    if (updateData.tags) {
      projectUpdate.tags = updateData.tags
    }

    if (updateData.visibility) {
      projectUpdate.visibility = updateData.visibility
    }

    // Update the project
    const { data: project, error } = await supabase
      .from('folders')
      .update(projectUpdate)
      .eq('id', projectId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`)
    }

    // Revalidate the organization page
    revalidatePath(`/${organizationName}`)

    return { success: true, project }
  } catch (error) {
    console.error('Update project error:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update project',
    }
  }
}

// Delete a project (soft delete)
export async function deleteProject(
  organizationName: string,
  projectId: string,
) {
  try {
    const user = await getCurrentUser()
    const organization = await getOrganizationByName(organizationName)

    // Check permissions (owner/admin can delete projects)
    const userRole = await checkUserPermissions(organization.id, user.id)
    if (!['owner', 'admin'].includes(userRole!)) {
      throw new Error('Insufficient permissions to delete projects')
    }

    const supabase = await createClient()

    // Verify project exists and belongs to this organization
    const { data: project, error: fetchError } = await supabase
      .from('folders')
      .select('id, folder_name')
      .eq('id', projectId)
      .eq('organization_id', organization.id)
      .is('parent_id', null)
      .single()

    if (fetchError || !project) {
      throw new Error('Project not found')
    }

    // Soft delete the project
    const { error } = await supabase
      .from('folders')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`)
    }

    // Revalidate the organization page
    revalidatePath(`/${organizationName}`)

    return { success: true }
  } catch (error) {
    console.error('Delete project error:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete project',
    }
  }
}

// Get projects with enhanced data for organization view
export async function getProjectsForOrganization(organizationName: string) {
  try {
    const organization = await getOrganizationByName(organizationName)
    const supabase = await createClient()

    const { data: projects, error } = await supabase
      .from('folders')
      .select(
        `
        id,
        folder_name,
        full_path,
        tags,
        visibility,
        metadata,
        created_at,
        updated_at,
        created_by,
        updated_by
      `,
      )
      .eq('organization_id', organization.id)
      .is('parent_id', null)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`)
    }

    return { success: true, projects: projects || [] }
  } catch (error) {
    console.error('Get projects error:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch projects',
      projects: [],
    }
  }
}

// Get user role in organization
export async function getUserOrganizationRole(organizationName: string) {
  try {
    const user = await getCurrentUser()
    const organization = await getOrganizationByName(organizationName)

    const userRole = await checkUserPermissions(organization.id, user.id)

    return { success: true, role: userRole }
  } catch (error) {
    console.error('Get user role error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user role',
      role: null,
    }
  }
}
