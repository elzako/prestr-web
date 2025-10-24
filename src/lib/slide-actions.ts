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
