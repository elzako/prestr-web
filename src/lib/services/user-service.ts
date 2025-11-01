/**
 * User Service
 *
 * Handles user-related data fetching operations including roles and permissions.
 * Automatically handles E2E test mode internally.
 */

import { createClient } from '@/lib/supabase/server'
import { isE2ETestMode } from '@/lib/e2e/test-mode'
import { getUserRoles as getTestUserRoles } from '@/lib/e2e/testStore'
import { getUser as getAuthUser } from '@/lib/auth-actions'
import { getRootFolderId } from './folder-service'
import type { UserRoles } from '@/types'

/**
 * Get current authenticated user's roles
 *
 * @returns User roles object or null if not authenticated
 */
export async function getCurrentUserRoles(): Promise<UserRoles | null> {
  if (isE2ETestMode()) {
    const user = await getAuthUser()
    if (!user) {
      return null
    }
    return getTestUserRoles(user.id)
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return await getUserRoles(user.id)
}

/**
 * Get user roles by user ID
 *
 * @param userId - The user ID
 * @returns User roles object with organization and folder roles
 */
export async function getUserRoles(userId: string): Promise<UserRoles> {
  if (isE2ETestMode()) {
    return getTestUserRoles(userId)
  }

  const supabase = await createClient()

  const { data: orgRoles } = await supabase
    .from('user_organization_roles')
    .select('organization_id, user_role')
    .eq('user_id', userId)

  const { data: folderRoles } = await supabase
    .from('user_folder_roles')
    .select('folder_id, user_role')
    .eq('user_id', userId)

  return {
    organizationRoles: orgRoles?.map((role) => role.organization_id) || [],
    folderRoles:
      folderRoles?.map((role) => ({
        folder_id: role.folder_id,
        user_role: role.user_role || 'member',
      })) || [],
  }
}

/**
 * Check if the current user has edit permissions for a resource
 * Based on organization admin/owner roles or folder admin/contributor roles
 *
 * @param parentId - The parent folder ID of the resource
 * @returns True if user can edit, false otherwise
 */
export async function checkEditPermissions(parentId: string): Promise<boolean> {
  const [userRoles, rootFolderId] = await Promise.all([
    getCurrentUserRoles(),
    getRootFolderId(parentId),
  ])

  if (!userRoles || !rootFolderId) return false

  const { organizationRoles, folderRoles } = userRoles

  const isOrgAdmin = ['owner', 'admin'].some((role) =>
    organizationRoles.includes(role),
  )

  if (isOrgAdmin) return true

  const folderRole = folderRoles.find((r) => r.folder_id === rootFolderId)

  return ['admin', 'contributor'].includes(folderRole?.user_role ?? '')
}
