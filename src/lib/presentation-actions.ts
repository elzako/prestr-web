import { createClient } from '@/lib/supabase/client'

// Client-side function to create a new presentation
export async function createPresentation(
  parentFolderId: string,
  presentationName: string,
  tags: string[],
  slides: Array<{
    slide_id: string
    object_id: string
  }>,
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

  // Check edit permissions via root folder
  const { data: rootFolderId, error: rootError } = await supabase.rpc(
    'get_root_folder_id',
    { folder_id: parentFolderId },
  )

  if (rootError || !rootFolderId) {
    throw new Error('Failed to verify permissions')
  }

  // Get user's organization roles
  const { data: orgRoles } = await supabase
    .from('user_organization_roles')
    .select('user_role')
    .eq('user_id', user.id)

  const isOrgAdmin = orgRoles?.some((role) =>
    ['owner', 'admin'].includes(role.user_role || ''),
  )

  // Get user's folder roles
  const { data: folderRoles } = await supabase
    .from('user_folder_roles')
    .select('user_role')
    .eq('user_id', user.id)
    .eq('folder_id', rootFolderId)

  const canEdit =
    isOrgAdmin ||
    folderRoles?.some((role) =>
      ['admin', 'contributor'].includes(role.user_role || ''),
    )

  if (!canEdit) {
    throw new Error('Insufficient permissions to create presentation')
  }

  // Format slides with order
  const formattedSlides = slides.map((slide, index) => ({
    order: index + 1,
    slide_id: slide.slide_id,
    object_id: slide.object_id,
  }))

  // Create the presentation
  const insertData = {
    parent_id: parentFolderId,
    presentation_name: presentationName,
    tags: tags.length > 0 ? tags : [],
    slides: formattedSlides,
    settings: {
      pptxDownloadRole: 'public' as const,
      pdfDownloadRole: 'public' as const,
      chatRole: 'public' as const,
    },
    version: 1,
    created_by: user.id,
    updated_by: user.id,
  }

  const { data, error } = await supabase
    .from('presentations')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create presentation: ${error.message}`)
  }

  return data
}

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

// Reorder slides in a presentation
export async function updatePresentationContent(
  presentationId: string,
  slides: Array<{
    order: number
    slide_id: string
    object_id: string
  }>,
) {
  // Validate slides array
  if (!Array.isArray(slides) || slides.length === 0) {
    throw new Error('Invalid slides array')
  }

  // Validate slide structure
  const orderSet = new Set<number>()
  for (const slide of slides) {
    if (
      !slide.slide_id ||
      !slide.object_id ||
      typeof slide.order !== 'number'
    ) {
      throw new Error('Invalid slide structure')
    }
    if (orderSet.has(slide.order)) {
      throw new Error('Duplicate order values')
    }
    orderSet.add(slide.order)
  }

  const supabase = createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  // Check if presentation exists and get parent folder
  const { data: presentation, error: presentationError } = await supabase
    .from('presentations')
    .select('parent_id')
    .eq('id', presentationId)
    .single()

  if (presentationError || !presentation) {
    throw new Error('Presentation not found')
  }

  // Check edit permissions via root folder
  const { data: rootFolderId, error: rootError } = await supabase.rpc(
    'get_root_folder_id',
    { folder_id: presentation.parent_id },
  )

  if (rootError || !rootFolderId) {
    throw new Error('Failed to verify permissions')
  }

  // Get user's organization roles
  const { data: orgRoles } = await supabase
    .from('user_organization_roles')
    .select('user_role')
    .eq('user_id', user.id)

  const isOrgAdmin = orgRoles?.some((role) =>
    ['owner', 'admin'].includes(role.user_role || ''),
  )

  // Get user's folder roles
  const { data: folderRoles } = await supabase
    .from('user_folder_roles')
    .select('user_role')
    .eq('user_id', user.id)
    .eq('folder_id', rootFolderId)

  const canEdit =
    isOrgAdmin ||
    folderRoles?.some((role) =>
      ['admin', 'contributor'].includes(role.user_role || ''),
    )

  if (!canEdit) {
    throw new Error('Insufficient permissions')
  }

  // Update presentation with new slide order
  const { data, error } = await supabase
    .from('presentations')
    .update({
      slides: slides,
      updated_at: new Date().toISOString(),
    })
    .eq('id', presentationId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update slide order: ${error.message}`)
  }

  return data
}
