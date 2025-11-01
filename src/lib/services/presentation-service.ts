/**
 * Presentation Service
 *
 * Handles presentation-related data fetching operations.
 * Automatically handles E2E test mode internally.
 */

import { createClient } from '@/lib/supabase/server'
import { isE2ETestMode } from '@/lib/e2e/test-mode'
import { getPresentation as getTestPresentation } from '@/lib/e2e/testStore'
import type { PresentationDetail } from '@/types'

/**
 * Get presentation data by parent folder ID and presentation name
 *
 * @param parentId - The parent folder ID
 * @param presentationName - The presentation file name (without .presentation extension)
 * @returns Presentation detail object or null if not found
 */
export async function getPresentationData(
  parentId: string,
  presentationName: string,
): Promise<PresentationDetail | null> {
  if (isE2ETestMode()) {
    const presentation = getTestPresentation(parentId, presentationName)
    return presentation || null
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('presentations')
    .select(
      'id, parent_id, file_name, metadata, created_at, updated_at, tags, slides, settings, version',
    )
    .eq('parent_id', parentId)
    .eq('file_name', presentationName)
    .maybeSingle()

  if (error) {
    console.error('Error fetching presentation:', error)
    return null
  }

  return data
}

/**
 * Get presentation info for WOPI operations
 * Returns a formatted string with organization, presentation ID, and object ID
 *
 * @param orgId - The organization ID
 * @param parentId - The parent folder ID
 * @param presentationName - The presentation file name (with .presentation extension)
 * @returns Formatted presentation info string for WOPI
 */
export async function getPresentationInfo(
  orgId: string,
  parentId: string,
  presentationName: string,
): Promise<string | null> {
  const supabase = await createClient()
  const { data: presentation, error } = await supabase
    .from('presentations')
    .select('id, object_id')
    .eq('parent_id', parentId)
    .eq(
      'file_name',
      presentationName.substring(0, presentationName.length - 13),
    )
    .single()

  if (error || !presentation) {
    console.error('Error fetching presentation:', error)
    return null
  }

  return `${orgId}~${presentation.id}~${presentation.object_id}.pptx`
}
