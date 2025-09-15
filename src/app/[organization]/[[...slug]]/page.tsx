import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '../../../../types/database.types'
import OrgHeader from '@/components/OrgHeader'
import SlideView from '@/components/SlideView'
import ProjectList from '@/components/ProjectList'
import FolderView from '@/components/FolderView'
import PresentationView from '@/components/PresentationView'

// Disable caching for data freshness
// In production, consider export const revalidate = 3600 for hourly updates
export const revalidate = 0

type Organization = Pick<
  Tables<'organizations'>,
  'id' | 'organization_name' | 'metadata' | 'tags'
>
type Project = Pick<
  Tables<'folders'>,
  | 'id'
  | 'folder_name'
  | 'full_path'
  | 'tags'
  | 'visibility'
  | 'metadata'
  | 'created_at'
  | 'updated_at'
>

type Folder = Pick<
  Tables<'folders'>,
  'id' | 'folder_name' | 'full_path' | 'tags' | 'visibility'
>

type Presentation = Pick<
  Tables<'presentations'>,
  'id' | 'presentation_name' | 'metadata' | 'created_at' | 'tags' | 'settings'
>

type Slide = Pick<
  Tables<'slides'>,
  'id' | 'slide_name' | 'metadata' | 'created_at' | 'tags' | 'object_id'
>

type SlideDetail = Pick<
  Tables<'slides'>,
  | 'id'
  | 'slide_name'
  | 'metadata'
  | 'created_at'
  | 'updated_at'
  | 'object_id'
  | 'tags'
  | 'visibility'
>

type PresentationDetail = Pick<
  Tables<'presentations'>,
  | 'id'
  | 'presentation_name'
  | 'metadata'
  | 'created_at'
  | 'updated_at'
  | 'tags'
  | 'slides'
  | 'settings'
  | 'version'
>

interface PageProps {
  params: Promise<{
    organization: string
    slug?: string[]
  }>
}

interface FolderContentData {
  folders: Folder[]
  presentations: Presentation[]
  slides: Slide[]
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

// SlideView moved to src/components/SlideView.tsx
// PresentationView moved to src/components/PresentationView.tsx

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

  const organization = await getOrganization(organizationName)

  if (!organization) {
    notFound()
  }

  // If no slug, show organization root with top-level projects
  if (!slug || slug.length === 0) {
    const projects = await getTopLevelProjects(organization.id)

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <OrgHeader organization={organization} />

          <div className="mt-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h2 className="text-xl font-semibold text-gray-900">
                  Projects
                </h2>
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
      <SlideView
        slide={slide}
        organization={organization}
        folderPath={folderPath}
      />
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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <OrgHeader organization={organization} />
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
          <OrgHeader organization={organization} />
          <FolderView
            organization={organization}
            folderId={folderId}
            folderPath={currentPath}
            content={folderContent}
            projectId={projectId}
            subFolderIds={subFolderIds}
          />
        </div>
      </div>
    )
  }
}
