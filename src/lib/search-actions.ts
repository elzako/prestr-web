'use server'

/**
 * Search Actions with Role-Based Access Control
 *
 * This module implements role-based filtering for slide search functionality:
 *
 * Visibility Rules:
 * - PUBLIC slides: Visible to everyone (including unauthenticated users)
 * - INTERNAL slides: Only visible to users who have roles in the same organization as the slide
 * - RESTRICTED slides: Only visible to users who have folder roles for the project_id of the slide
 *
 * Security Implementation:
 * - PUBLIC: No restrictions, available to all users
 * - INTERNAL: Requires user to have organization membership (user_organization_roles)
 * - RESTRICTED: Requires user to have folder membership for the specific project (user_folder_roles)
 *
 * Performance Optimization:
 * - User roles are fetched once per request at the page level and passed down to avoid redundant DB queries
 * - searchSlides accepts optional userRoles parameter to use cached roles instead of querying database
 * - Falls back to public-only access if no userRoles provided (unauthenticated users)
 */

import type { SearchOptions, SearchResult, TypesenseSlideResult } from '@/types'
import Typesense from 'typesense'
import { getSlideImageUrl } from './cloudinary'
import { createClient } from './supabase/server'
import { isE2ETestMode } from '@/lib/e2e/test-mode'
import {
  searchSlidesInStore,
  getUserRoles as getTestUserRoles,
} from '@/lib/e2e/testStore'
import { getUser as getAuthUser } from '@/lib/auth-actions'

export async function searchSlides(options: SearchOptions): Promise<{
  success: boolean
  results?: SearchResult[]
  total?: number
  error?: string
}> {
  const {
    organizationId,
    projectId,
    subFolderIds,
    query,
    limit = 20,
    offset = 0,
    filters = [],
    userRoles,
  } = options

  if (isE2ETestMode()) {
    try {
      let effectiveRoles = userRoles
      if (!effectiveRoles) {
        const currentUser = await getAuthUser()
        effectiveRoles = currentUser
          ? getTestUserRoles(currentUser.id)
          : {
              organizationRoles: [],
              folderRoles: [],
            }
      }

      const permittedOrgIds = effectiveRoles
        ? effectiveRoles.organizationRoles
        : []
      const permittedFolderIds = effectiveRoles
        ? effectiveRoles.folderRoles.map((role) => role.folder_id)
        : []

      const { results, total } = searchSlidesInStore(query, {
        organizationId: organizationId || null,
        limit,
        offset,
        permittedFolderIds,
        permittedOrgIds,
      })

      return { success: true, results, total }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      }
    }
  }

  // Check if Typesense is configured
  const searchHost = process.env.TYPESENSE_HOST
  const searchPort = process.env.TYPESENSE_PORT
  const searchProtocol = process.env.TYPESENSE_PROTOCOL
  const searchKey = process.env.TYPESENSE_API_KEY

  if (!searchHost || !searchPort || !searchProtocol || !searchKey) {
    return {
      success: false,
      error: 'Search service not configured',
    }
  }

  try {
    const supabase = await createClient()

    const port = Number(searchPort)
    if (Number.isNaN(port)) {
      return {
        success: false,
        error: 'Search service not configured',
      }
    }

    // Initialize Typesense client
    const client = new Typesense.Client({
      nodes: [
        {
          host: searchHost,
          port,
          protocol: searchProtocol,
        },
      ],
      apiKey: searchKey,
      connectionTimeoutSeconds: 2,
    })

    const health = await client.health.retrieve()

    if (!health?.ok) {
      return {
        success: false,
        error: 'Search service is not available',
      }
    }

    const quoteFilterValue = (value: string) =>
      `\`${value.replace(/`/g, '\\`')}\``

    // Build visibility filters based on user roles (passed from parent component)
    let visibilityFilters: string[] = []

    if (!userRoles) {
      // No user roles provided - likely unauthenticated user, only show public slides
      visibilityFilters.push(`visibility:=${quoteFilterValue('public')}`)
    } else {
      // Build complex visibility filter based on user's roles and permissions
      const filterParts: string[] = []

      // 1. Public slides are always visible to authenticated users
      filterParts.push(`visibility:=${quoteFilterValue('public')}`)

      // 2. Internal slides - visible to users with organization membership
      // Example: User belongs to org "org-123" -> can see internal slides from org-123
      if (userRoles.organizationRoles.length > 0) {
        const orgIds = userRoles.organizationRoles
          .map((id) => quoteFilterValue(id))
          .join(',')
        filterParts.push(
          `(visibility:=${quoteFilterValue('internal')} && organization_id:=[${orgIds}])`,
        )
      }

      // 3. Restricted slides - visible to users with project-level folder access
      // Example: User has folder role in project "proj-456" -> can see restricted slides from proj-456
      if (userRoles.folderRoles.length > 0) {
        const projectIds = userRoles.folderRoles
          .map((role) => quoteFilterValue(role.folder_id))
          .join(',')
        filterParts.push(
          `(visibility:=${quoteFilterValue('restricted')} && project_id:=[${projectIds}])`,
        )
      }

      // Combine all visibility conditions with OR logic
      // Final filter: (public) OR (internal AND user_in_org) OR (restricted AND user_has_project_access)
      if (filterParts.length > 0) {
        visibilityFilters.push(`(${filterParts.join(' || ')})`)
      } else {
        // User has roles but no specific permissions - only public slides
        visibilityFilters.push(`visibility:=${quoteFilterValue('public')}`)
      }
    }

    // Build filter string for organization and project
    const filterArray: string[] = []

    // Add organization filter if provided
    if (organizationId) {
      filterArray.push(`organization_id:=${quoteFilterValue(organizationId)}`)
    }

    // Add project filter if projectId is provided
    if (projectId) {
      filterArray.push(`project_id:=${quoteFilterValue(projectId)}`)
    }

    // Add sub folder filters if subFolderIds is provided
    if (subFolderIds && subFolderIds.length > 0) {
      filterArray.push(
        `parent_id:=[${subFolderIds
          .map((id) => quoteFilterValue(id))
          .join(',')}]`,
      )
    }

    // Combine all filters
    const allFilters = [...filterArray, ...visibilityFilters, ...filters].join(
      ' && ',
    )

    const page = limit > 0 ? Math.floor(offset / limit) + 1 : 1

    // Perform search
    const searchResponse = await client.collections('slides').documents().search(
      {
        q: query,
        query_by: 'slide_text,description,file_name,notes_text',
        per_page: limit,
        page,
        filter_by: allFilters || undefined,
        highlight_fields: 'slide_text,description,file_name',
      },
    )

    // Map results and add image URLs and parent paths (server-side only)
    const resultsWithImages: SearchResult[] = await Promise.all(
      (searchResponse.hits || []).map(async (hit) => {
        const result = hit.document as TypesenseSlideResult

        // Generate image URL server-side
        const imageUrl = getSlideImageUrl(
          result.organization_id,
          result.id,
          result.object_id,
        )

        // Fetch parent folder path
        const { data: folder } = await supabase
          .from('folders')
          .select('full_path')
          .eq('id', result.parent_id)
          .single()

        const parent_path = folder?.full_path || null

        return {
          ...result,
          imageUrl,
          parent_path,
        }
      }),
    )

    return {
      success: true,
      results: resultsWithImages,
      total: searchResponse.found || 0,
    }
  } catch (error) {
    console.error('Typesense error:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Search service unavailable',
    }
  }
}
