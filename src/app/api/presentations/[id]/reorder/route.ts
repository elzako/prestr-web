import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface SlideOrder {
  order: number
  slide_id: string
  object_id: string
}

interface ReorderRequestBody {
  slides: SlideOrder[]
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: presentationId } = await params
    const body: ReorderRequestBody = await request.json()
    const { slides } = body

    // Validate slides array
    if (!Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json(
        { error: 'Invalid slides array' },
        { status: 400 },
      )
    }

    // Validate slide structure
    const orderSet = new Set<number>()
    for (const slide of slides) {
      if (
        !slide.slide_id ||
        !slide.object_id ||
        typeof slide.order !== 'number'
      ) {
        return NextResponse.json(
          { error: 'Invalid slide structure' },
          { status: 400 },
        )
      }
      if (orderSet.has(slide.order)) {
        return NextResponse.json(
          { error: 'Duplicate order values' },
          { status: 400 },
        )
      }
      orderSet.add(slide.order)
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 },
      )
    }

    // Check if presentation exists and get parent folder
    const { data: presentation, error: presentationError } = await supabase
      .from('presentations')
      .select('parent_id')
      .eq('id', presentationId)
      .single()

    if (presentationError || !presentation) {
      return NextResponse.json(
        { error: 'Presentation not found' },
        { status: 404 },
      )
    }

    // Check edit permissions via root folder
    const { data: rootFolderId, error: rootError } = await supabase.rpc(
      'get_root_folder_id',
      { folder_id: presentation.parent_id },
    )

    if (rootError || !rootFolderId) {
      return NextResponse.json(
        { error: 'Failed to verify permissions' },
        { status: 403 },
      )
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
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      )
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
      console.error('Failed to update presentation:', error)
      return NextResponse.json(
        { error: 'Failed to update slide order' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error reordering slides:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
