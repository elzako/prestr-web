import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slideId: string }> },
) {
  try {
    const { slideId } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the current slide to verify draft exists
    const { data: slide, error: fetchError } = await supabase
      .from('slides')
      .select('draft_object_id')
      .eq('id', slideId)
      .single()

    if (fetchError || !slide) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 })
    }

    if (!slide.draft_object_id) {
      return NextResponse.json(
        { error: 'No draft to discard' },
        { status: 400 },
      )
    }

    // Discard the draft: set draft_object_id to null
    const { error: updateError } = await supabase
      .from('slides')
      .update({
        draft_object_id: null,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', slideId)

    if (updateError) {
      console.error('Error discarding draft:', updateError)
      return NextResponse.json(
        { error: 'Failed to discard draft' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Draft discarded successfully',
    })
  } catch (error) {
    console.error('Unexpected error discarding draft:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

