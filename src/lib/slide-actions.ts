'use server'

import { createClient } from '@/lib/supabase/server'
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

// Server action to update slide
export async function updateSlide(
  slideId: string,
  updates: {
    file_name?: string
    description?: string
    tags?: string[]
  },
) {
  const user = await getCurrentUser()
  const supabase = await createClient()

  // Update the slide
  const { data, error } = await supabase
    .from('slides')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', slideId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update slide: ${error.message}`)
  }

  return data
}

// Server action to publish a draft slide
export async function publishDraft(slideId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    const supabase = await createClient()

    // Get the current slide to retrieve draft_object_id
    const { data: slide, error: fetchError } = await supabase
      .from('slides')
      .select('draft_object_id, parent_id')
      .eq('id', slideId)
      .single()

    if (fetchError || !slide) {
      return {
        success: false,
        error: 'Slide not found',
      }
    }

    if (!slide.draft_object_id) {
      return {
        success: false,
        error: 'No draft to publish',
      }
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
      return {
        success: false,
        error: 'Failed to publish draft',
      }
    }

    // Revalidate the slide's parent folder path
    if (slide.parent_id) {
      revalidatePath(`/[organization]/[[...slug]]`, 'page')
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error publishing draft:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish draft',
    }
  }
}

// Server action to discard a draft slide
export async function discardDraft(slideId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    const supabase = await createClient()

    // Get the current slide to verify draft exists
    const { data: slide, error: fetchError } = await supabase
      .from('slides')
      .select('draft_object_id, parent_id')
      .eq('id', slideId)
      .single()

    if (fetchError || !slide) {
      return {
        success: false,
        error: 'Slide not found',
      }
    }

    if (!slide.draft_object_id) {
      return {
        success: false,
        error: 'No draft to discard',
      }
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
      return {
        success: false,
        error: 'Failed to discard draft',
      }
    }

    // Revalidate the slide's parent folder path
    if (slide.parent_id) {
      revalidatePath(`/[organization]/[[...slug]]`, 'page')
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error discarding draft:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to discard draft',
    }
  }
}
