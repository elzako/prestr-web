import { createClient } from '@/lib/supabase/client'

// Client-side function to update slide
export async function updateSlide(
  slideId: string,
  updates: {
    file_name?: string
    description?: string
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

// Publish a draft slide
export async function publishDraft(slideId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const response = await fetch(`/api/slides/publish/${slideId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to publish draft',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error publishing draft:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish draft',
    }
  }
}

// Discard a draft slide
export async function discardDraft(slideId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const response = await fetch(`/api/slides/discard/${slideId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to discard draft',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error discarding draft:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to discard draft',
    }
  }
}
