import CompactOrgHeader from '@/components/CompactOrgHeader'
import FolderView from '@/components/FolderView'
import OrgHeader from '@/components/OrgHeader'
import PresentationView from '@/components/PresentationView'
import ProjectList from '@/components/ProjectList'
import SlideView from '@/components/SlideView'
import { createClient } from '@/lib/supabase/server'
import { getUserOrganizationRole } from '@/lib/organization-server-actions'
import type {
  FolderContent,
  Organization,
  PresentationDetail,
  Project,
  SlideDetail,
  UserRoles,
} from '@/types'
import { notFound } from 'next/navigation'

export const revalidate = 3600

interface PageProps {
  params: Promise<{
    organization: string
    slug?: string[]
  }>
}

type FolderContentData = FolderContent

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

async function getCurrentUserRoles(): Promise<UserRoles | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return await getUserRoles(user.id)
}

async function getUserRoles(userId: string): Promise<UserRoles> {
  const supabase = await createClient()

  // Get user organization roles
  const { data: orgRoles } = await supabase
    .from('user_organization_roles')
    .select('organization_id, user_role')
    .eq('user_id', userId)

  // Get user folder roles
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

async function getTopLevelProjects(organizationId: string): Promise<Project[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('folders')
    .select(
      'id, folder_name, full_path, tags, visibility, metadata, created_at, updated_at',
    )
    .eq('organization_id', organizationId)
    .is('parent_id', null)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return data || []
}

async function getFolderId(
  organizationId: string,
  currentPath: string,
): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_folder_id_by_full_path', {
    org_id: organizationId,
    current_path: currentPath.startsWith('/') ? currentPath : `/${currentPath}`,
  })

  if (error) {
    console.error('Error fetching folder ID:', error)
    return null
  }

  return data
}

async function getRootFolderId(folderId: string): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_root_folder_id', {
    folder_id: folderId,
  })

  if (error) {
    console.error('Error fetching root folder ID:', error)
    return null
  }

  return data
}

async function getSubFolderIds(folderId: string): Promise<string[] | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc(
    'get_subfolder_ids_including_self',
    {
      p_folder_id: folderId,
    },
  )

  if (error) {
    console.error('Error fetching sub folder IDs:', error)
    return []
  }

  return data
}

async function getFolderContent(folderId: string): Promise<FolderContentData> {
  const supabase = await createClient()

  // Fetch sub-folders
  const { data: folders, error: foldersError } = await supabase
    .from('folders')
    .select('id, folder_name, full_path, tags, visibility')
    .eq('parent_id', folderId)
    .is('deleted_at', null)
    .order('folder_name', { ascending: true })

  // Fetch presentations
  const { data: presentations, error: presentationsError } = await supabase
    .from('presentations')
    .select('id, presentation_name, metadata, created_at, tags, settings')
    .eq('parent_id', folderId)
    .is('deleted_at', null)
    .order('presentation_name', { ascending: true })

  // Fetch slides
  const { data: slides, error: slidesError } = await supabase
    .from('slides')
    .select('id, slide_name, metadata, created_at, tags, object_id')
    .eq('parent_id', folderId)
    .is('deleted_at', null)
    .order('slide_name', { ascending: true })

  if (foldersError) {
    console.error('Error fetching folders:', foldersError)
  }

  if (presentationsError) {
    console.error('Error fetching presentations:', presentationsError)
  }

  if (slidesError) {
    console.error('Error fetching slides:', slidesError)
  }

  return {
    folders: folders || [],
    presentations: presentations || [],
    slides: slides || [],
  }
}

async function getSlideData(
  parentId: string,
  slideName: string,
): Promise<SlideDetail | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('slides')
    .select(
      'id, slide_name, metadata, created_at, updated_at, object_id, tags, visibility',
    )
    .eq('parent_id', parentId)
    .eq('slide_name', slideName)
    .maybeSingle()

  if (error) {
    console.error('Error fetching slide:', error)
    return null
  }

  return data
}

async function getPresentationData(
  parentId: string,
  presentationName: string,
): Promise<PresentationDetail | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('presentations')
    .select(
      'id, presentation_name, metadata, created_at, updated_at, tags, slides, settings, version',
    )
    .eq('parent_id', parentId)
    .eq('presentation_name', presentationName)
    .maybeSingle()

  if (error) {
    console.error('Error fetching presentation:', error)
    return null
  }

  return data
}

export async function generateMetadata({ params }: PageProps) {
  const { organization: organizationName, slug } = await params
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

  if (!slug || slug.length === 0) {
    return {
      title: `${displayName} - Projects`,
      description: metadata?.about || `Explore projects from ${displayName}`,
    }
  }

  // Check if this is a slide or presentation route
  const lastSegment = slug[slug.length - 1]
  const isSlideRoute = lastSegment?.endsWith('.slide')
  const isPresentationRoute = lastSegment?.endsWith('.presentation')

  if (isSlideRoute) {
    const slideName = lastSegment.replace('.slide', '')
    const folderPath = slug.slice(0, -1).join('/')
    return {
      title: `${slideName} - ${folderPath} - ${displayName}`,
      description: `Slide: ${slideName} in ${folderPath}`,
    }
  }

  if (isPresentationRoute) {
    const presentationName = lastSegment.replace('.presentation', '')
    const folderPath = slug.slice(0, -1).join('/')
    return {
      title: `${presentationName} - ${folderPath} - ${displayName}`,
      description: `Presentation: ${presentationName} in ${folderPath}`,
    }
  }

  const currentPath = slug.join('/')
  return {
    title: `${currentPath} - ${displayName}`,
    description: `Browse ${currentPath} in ${displayName}`,
  }
}

export default async function OrganizationPage({ params }: PageProps) {
  const { organization: organizationName, slug } = await params

  const [organization, userRoles] = await Promise.all([
    getOrganization(organizationName),
    getCurrentUserRoles(),
  ])

  if (!organization) {
    notFound()
  }

  // Get user's role in this specific organization
  const userOrgRoleResult = await getUserOrganizationRole(organization.id)
  const userOrganizationRole = userOrgRoleResult.success
    ? userOrgRoleResult.role
    : null

  // If no slug, show organization root with top-level projects
  if (!slug || slug.length === 0) {
    const projects = await getTopLevelProjects(organization.id)

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <OrgHeader
            organization={organization}
            userRole={userOrganizationRole}
          />

          <div className="mt-8">
            <ProjectList
              projects={projects}
              organizationName={organizationName}
              organizationId={organization.id}
              userRoles={userRoles}
            />
          </div>
        </div>
      </div>
    )
  }

  // Check if this is a slide or presentation route
  const lastSegment = slug[slug.length - 1]
  const isSlideRoute = lastSegment?.endsWith('.slide')
  const isPresentationRoute = lastSegment?.endsWith('.presentation')

  if (isSlideRoute) {
    // Handle slide view
    const slideName = lastSegment.replace('.slide', '')
    const folderPath = slug.slice(0, -1).join('/')

    // Get folder ID using the full path
    const folderId = await getFolderId(organization.id, folderPath)
    if (!folderId) {
      notFound()
    }

    // Get slide data
    const slide = await getSlideData(folderId, slideName)
    if (!slide) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <CompactOrgHeader
          organization={organization}
          userRole={userOrganizationRole}
        />
        <SlideView
          slide={slide}
          organization={organization}
          folderPath={folderPath}
        />
      </div>
    )
  } else if (isPresentationRoute) {
    // Handle presentation view
    const presentationName = lastSegment.replace('.presentation', '')
    const folderPath = slug.slice(0, -1).join('/')

    // Get folder ID using the full path
    const folderId = await getFolderId(organization.id, folderPath)
    if (!folderId) {
      notFound()
    }

    // Get presentation data
    const presentation = await getPresentationData(folderId, presentationName)
    if (!presentation) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <CompactOrgHeader
          organization={organization}
          userRole={userOrganizationRole}
        />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <PresentationView
            presentation={presentation}
            organization={organization}
            folderPath={folderPath}
          />
        </div>
      </div>
    )
  } else {
    // Handle nested folder navigation
    const currentPath = slug.join('/')
    const folderId = await getFolderId(organization.id, currentPath)

    if (!folderId) {
      notFound()
    }

    const [folderContent, projectId, subFolderIds] = await Promise.all([
      getFolderContent(folderId),
      getRootFolderId(folderId),
      slug.length === 1 ? Promise.resolve([]) : getSubFolderIds(folderId),
    ])

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <OrgHeader
            organization={organization}
            userRole={userOrganizationRole}
          />
          <FolderView
            organization={organization}
            folderId={folderId}
            folderPath={currentPath}
            content={folderContent}
            projectId={projectId}
            subFolderIds={subFolderIds}
            userRoles={userRoles}
          />
        </div>
      </div>
    )
  }
}
