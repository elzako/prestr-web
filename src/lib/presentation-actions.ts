import { createClient } from '@/lib/supabase/client'

// Client-side function to update presentation
export async function updatePresentation(
  presentationId: string,
  updates: {
    presentation_name?: string
    tags?: string[]
  },
) {
  const supabase = createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  // Update the presentation
  const { data, error } = await supabase
    .from('presentations')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', presentationId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update presentation: ${error.message}`)
  }

  return data
}

// Check if user can edit presentation (admin/contributor only)
export async function checkPresentationEditPermissions(
  presentationId: string,
): Promise<boolean> {
  const supabase = createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return false
  }

  // Get presentation to find parent folder
  const { data: presentation, error: presentationError } = await supabase
    .from('presentations')
    .select('parent_id')
    .eq('id', presentationId)
    .single()

  if (presentationError || !presentation || !presentation.parent_id) {
    return false
  }

  // Get root folder ID for permissions check
  const { data: rootFolderId, error: rootError } = await supabase.rpc(
    'get_root_folder_id',
    {
      folder_id: presentation.parent_id,
    },
  )

  if (rootError || !rootFolderId) {
    return false
  }

  // Get user's organization roles
  const { data: orgRoles, error: orgError } = await supabase
    .from('user_organization_roles')
    .select('user_role, organization_id')
    .eq('user_id', user.id)

  if (orgError) {
    return false
  }

  // Check if user is org admin/owner
  const isOrgAdmin = orgRoles?.some((role) =>
    role.user_role ? ['owner', 'admin'].includes(role.user_role) : false,
  )

  if (isOrgAdmin) {
    return true
  }

  // Get user's folder roles
  const { data: folderRoles, error: folderError } = await supabase
    .from('user_folder_roles')
    .select('user_role')
    .eq('user_id', user.id)
    .eq('folder_id', rootFolderId)

  if (folderError) {
    return false
  }

  // Check if user has admin or contributor role for this folder
  const folderRole = folderRoles?.[0]?.user_role
  return ['admin', 'contributor'].includes(folderRole || '')
}

// Reorder slides in a presentation
export async function reorderSlides(
  presentationId: string,
  slides: Array<{
    order: number
    slide_id: string
    object_id: string
  }>,
) {
  const response = await fetch(`/api/presentations/${presentationId}/reorder`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ slides }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to reorder slides')
  }

  return response.json()
}
