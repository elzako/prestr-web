/**
 * Organization Service
 *
 * Handles organization-related data fetching operations.
 * Automatically handles E2E test mode internally.
 */

import { createClient } from '@/lib/supabase/server'
import { isE2ETestMode } from '@/lib/e2e/test-mode'
import {
  getOrganizationByName as getTestOrganizationByName,
  listProjects as listTestProjects,
} from '@/lib/e2e/testStore'
import type { Organization, Project } from '@/types'

/**
 * Get organization by name
 *
 * @param organizationName - The organization name to look up
 * @returns Organization object or null if not found
 */
export async function getOrganization(
  organizationName: string,
): Promise<Organization | null> {
  if (isE2ETestMode()) {
    const organization = getTestOrganizationByName(organizationName)
    return organization || null
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organizations')
    .select('id, organization_name, metadata, tags')
    .eq('organization_name', organizationName)
    .maybeSingle()

  if (error) {
    console.error('Error fetching organization:', error)
    return null
  }

  return data
}

/**
 * Get top-level projects (folders with no parent) for an organization
 *
 * @param organizationId - The organization ID
 * @returns Array of top-level projects
 */
export async function getTopLevelProjects(
  organizationId: string,
): Promise<Project[]> {
  if (isE2ETestMode()) {
    return listTestProjects(organizationId)
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('folders')
    .select(
      'id, organization_id, parent_id, folder_name, full_path, tags, visibility, metadata, created_at, updated_at, deleted_at',
    )
    .eq('organization_id', organizationId)
    .is('parent_id', null)
    .is('deleted_at', null)

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return data || []
}
