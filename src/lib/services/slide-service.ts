/**
 * Slide Service
 *
 * Handles slide-related data fetching operations.
 * Automatically handles E2E test mode internally.
 */

import { createClient } from '@/lib/supabase/server'
import { isE2ETestMode } from '@/lib/e2e/test-mode'
import { getSlide as getTestSlide } from '@/lib/e2e/testStore'
import { getSlideImageUrl as getCloudinarySlideImageUrl } from '@/lib/cloudinary'
import type { SlideDetail } from '@/types'

/**
 * Get slide data by parent folder ID and slide name
 *
 * @param parentId - The parent folder ID
 * @param slideName - The slide file name (without .slide extension)
 * @returns Slide detail object or null if not found
 */
export async function getSlideData(
  parentId: string,
  slideName: string,
): Promise<SlideDetail | null> {
  if (isE2ETestMode()) {
    const slide = getTestSlide(parentId, slideName)
    return slide || null
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('slides')
    .select(
      'id, parent_id, file_name, metadata, description, created_at, updated_at, object_id, draft_object_id, tags, visibility',
    )
    .eq('parent_id', parentId)
    .eq('file_name', slideName)
    .maybeSingle()

  if (error) {
    console.error('Error fetching slide:', error)
    return null
  }

  return data
}

/**
 * Get slide info for WOPI operations
 * Returns a formatted string with organization, slide ID, and object ID
 *
 * @param orgId - The organization ID
 * @param parentId - The parent folder ID
 * @param slideName - The slide file name (with .slide extension)
 * @returns Formatted slide info string for WOPI
 */
export async function getSlideInfo(
  orgId: string,
  parentId: string,
  slideName: string,
): Promise<string | null> {
  const supabase = await createClient()
  const { data: slide, error } = await supabase
    .from('slides')
    .select('id, object_id')
    .eq('parent_id', parentId)
    .eq('file_name', slideName.substring(0, slideName.length - 6))
    .single()

  if (error || !slide) {
    console.error('Error fetching slide:', error)
    return null
  }

  return `${orgId}~${slide.id}~${slide.object_id}.pptx`
}

/**
 * Get slide image URL from Cloudinary
 *
 * @param organizationId - The organization ID
 * @param slideId - The slide ID
 * @param objectId - The object ID
 * @returns Image URL
 */
export async function getSlideImageUrl(
  organizationId: string,
  slideId: string,
  objectId: string,
): Promise<string> {
  return getCloudinarySlideImageUrl(organizationId, slideId, objectId)
}
