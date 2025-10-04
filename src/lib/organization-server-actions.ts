'use server'

import { getUser as getAuthUser } from '@/lib/auth-actions'
import { createClient } from '@/lib/supabase/server'
import { isE2ETestMode } from '@/lib/e2e/test-mode'
import { getUserOrganizationRole as getTestUserOrganizationRole } from '@/lib/e2e/testStore'

async function getCurrentUser() {
  return await getAuthUser()
}

export async function getUserOrganizationRole(organizationId: string) {
  if (isE2ETestMode()) {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, role: null, error: 'User not authenticated' }
    }

    const role = getTestUserOrganizationRole(organizationId, user.id)
    return {
      success: true,
      role: role || null,
    }
  }

  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, role: null, error: 'User not authenticated' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_organization_roles')
      .select('user_role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      return { success: true, role: null }
    }

    return { success: true, role: data.user_role }
  } catch (error) {
    console.error('Get user organization role error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user role',
      role: null,
    }
  }
}

export async function checkUserIsOrganizationOwner(organizationId: string) {
  const result = await getUserOrganizationRole(organizationId)
  return result.success && result.role === 'owner'
}
