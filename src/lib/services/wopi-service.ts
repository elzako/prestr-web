/**
 * WOPI Service
 *
 * Handles WOPI token generation for Microsoft Office Online integration.
 */

import { createClient } from '@/lib/supabase/server'

export interface WopiTokenResponse {
  wopiUrl: string
  accessToken: string
  accessTokenTtl: number
}

/**
 * Get WOPI token for file access
 *
 * @param fileId - The file ID in the format "orgId~fileId~objectId.ext"
 * @param canWrite - Whether the user can write to the file
 * @param resourceType - The type of resource (slide, presentation, file)
 * @returns WOPI token response with URL and access token
 */
export async function getWopiToken(
  fileId: string,
  canWrite: boolean = false,
  resourceType: string,
): Promise<WopiTokenResponse | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error('User not authenticated for WOPI token')
    return null
  }

  const response = await fetch(`${process.env.PRESTR_API_URL}/wopi/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileId,
      userId: user.id,
      canWrite,
      ttlMs: 3600000,
      resourceType,
    }),
  })

  if (!response.ok) {
    console.error('Error fetching WOPI token')
    return null
  }

  return response.json()
}
