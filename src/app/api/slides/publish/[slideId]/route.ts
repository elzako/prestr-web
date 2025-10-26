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

    // Get the current slide to retrieve draft_object_id
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
        { error: 'No draft to publish' },
        { status: 400 },
      )
    }

    // Publish the draft: copy draft_object_id to object_id and clear draft_object_id
    const { error: updateError } = await supabase
      .from('slides')
      .update({
        object_id: slide.draft_object_id,
        draft_object_id: null,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', slideId)

    if (updateError) {
      console.error('Error publishing draft:', updateError)
      return NextResponse.json(
        { error: 'Failed to publish draft' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Draft published successfully',
    })
  } catch (error) {
    console.error('Unexpected error publishing draft:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

