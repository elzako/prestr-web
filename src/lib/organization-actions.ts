import { createClient } from '@/lib/supabase/client'
import type { OrganizationUpdateData } from '@/types/forms/organization-profile'

// Get current user
async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('User not authenticated')
  }

  return user
}

// Helper function to check if user is organization owner
async function checkUserIsOwner(organizationId: string, userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_organization_roles')
    .select('user_role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()

  if (error) {
    throw new Error('Failed to check user permissions')
  }

  return data.user_role === 'owner'
}

// Get organization by ID
async function getOrganizationById(organizationId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()

  if (error) {
    throw new Error('Organization not found')
  }

  return data
}

// Update organization profile
export async function updateOrganizationProfile(
  organizationId: string,
  updateData: Omit<OrganizationUpdateData, 'updated_by'>,
) {
  try {
    const user = await getCurrentUser()

    // Check if user is organization owner
    const isOwner = await checkUserIsOwner(organizationId, user.id)
    if (!isOwner) {
      return {
        success: false,
        error: 'Only organization owners can update the profile',
      }
    }

    const supabase = createClient()

    // Prepare update data
    const finalUpdateData: OrganizationUpdateData = {
      ...updateData,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('organizations')
      .update(finalUpdateData)
      .eq('id', organizationId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Update organization profile error:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update organization profile',
    }
  }
}

// Check if organization name is available
export async function checkOrganizationNameAvailability(
  organizationName: string,
  currentOrganizationId: string,
) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('organization_name', organizationName)
      .neq('id', currentOrganizationId)

    if (error) {
      throw error
    }

    return {
      success: true,
      available: data.length === 0,
    }
  } catch (error) {
    console.error('Check organization name availability error:', error)
    return {
      success: false,
      available: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to check name availability',
    }
  }
}
