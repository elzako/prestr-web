'use server'

import { createClient } from '@/lib/supabase/server'

// Get current user (server-side)
async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

// Get user role in organization (server-side)
export async function getUserOrganizationRole(organizationId: string) {
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
      // User might not have a role in this organization
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

// Check if user is organization owner (server-side)
export async function checkUserIsOrganizationOwner(organizationId: string) {
  const result = await getUserOrganizationRole(organizationId)
  return result.success && result.role === 'owner'
}
