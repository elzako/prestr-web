import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '../../../types/database.types'
import OrgHeader from '@/components/OrgHeader'
import ProjectList from '@/components/ProjectList'

// Disable caching for data freshness
// In production, consider export const revalidate = 3600 for hourly updates
export const revalidate = 0

type Organization = Pick<
  Tables<'organizations'>,
  'id' | 'organization_name' | 'metadata' | 'tags'
>
type Folder = Pick<
  Tables<'folders'>,
  'id' | 'folder_name' | 'full_path' | 'tags' | 'visibility'
>

interface PageProps {
  params: Promise<{
    organization: string
  }>
}

async function getOrganization(
  organizationName: string,
): Promise<Organization | null> {
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

async function getTopLevelProjects(organizationId: string): Promise<Folder[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('folders')
    .select('id, folder_name, full_path, tags, visibility')
    .eq('organization_id', organizationId)
    .is('parent_id', null)
    .order('folder_name', { ascending: true })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return data || []
}

export async function generateMetadata({ params }: PageProps) {
  const { organization: organizationName } = await params
  const organization = await getOrganization(organizationName)

  if (!organization) {
    return {
      title: 'Organization Not Found',
    }
  }

  const metadata = organization.metadata as {
    name?: string
    about?: string
    website?: string
    location?: string
    profilePicture?: string
    displayMembers?: boolean
  } | null

  const displayName = metadata?.name || organization.organization_name

  return {
    title: `${displayName} - Projects`,
    description: metadata?.about || `Explore projects from ${displayName}`,
  }
}

export default async function OrganizationPage({ params }: PageProps) {
  const { organization: organizationName } = await params
  const organization = await getOrganization(organizationName)

  if (!organization) {
    notFound()
  }

  const projects = await getTopLevelProjects(organization.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <OrgHeader organization={organization} />

        <div className="mt-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
              <p className="mt-2 text-sm text-gray-700">
                {projects.length === 0
                  ? 'No projects available yet.'
                  : `${projects.length} project${projects.length === 1 ? '' : 's'} available`}
              </p>
            </div>
          </div>

          <ProjectList
            projects={projects}
            organizationName={organizationName}
          />
        </div>
      </div>
    </div>
  )
}
