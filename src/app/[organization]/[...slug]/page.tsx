import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '../../../../types/database.types'
import OrgHeader from '@/components/OrgHeader'
import FolderContentList from '@/components/FolderContentList'
import PresentationViewClient from '@/components/PresentationViewClient'
import SlideViewClient from '@/components/SlideViewClient'

// Disable caching for data freshness
export const revalidate = 0

type Organization = Pick<
  Tables<'organizations'>,
  'id' | 'organization_name' | 'metadata' | 'tags'
>

type Folder = Pick<
  Tables<'folders'>,
  'id' | 'folder_name' | 'full_path' | 'tags' | 'visibility'
>

type Presentation = Pick<
  Tables<'presentations'>,
  'id' | 'presentation_name' | 'metadata' | 'created_at'
>

type Slide = Pick<
  Tables<'slides'>,
  'id' | 'slide_name' | 'metadata' | 'created_at'
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
  | 'locked'
  | 'version'
>

interface PageProps {
  params: Promise<{
    organization: string
    slug: string[]
  }>
}

interface FolderContent {
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

async function getFolderId(
  organizationId: string,
  folderPath: string,
): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_folder_id_by_full_path', {
    org_id: organizationId,
    current_path: '/' + folderPath,
  })

  if (error) {
    console.error('Error fetching folder ID:', error)
    return null
  }

  return data
}

async function getFolderContent(folderId: string): Promise<FolderContent> {
  const supabase = await createClient()

  // Fetch sub-folders
  const { data: folders, error: foldersError } = await supabase
    .from('folders')
    .select('id, folder_name, full_path, tags, visibility')
    .eq('parent_id', folderId)
    .order('folder_name', { ascending: true })

  // Fetch presentations
  const { data: presentations, error: presentationsError } = await supabase
    .from('presentations')
    .select('id, presentation_name, metadata, created_at')
    .eq('parent_id', folderId)
    .order('presentation_name', { ascending: true })

  // Fetch slides
  const { data: slides, error: slidesError } = await supabase
    .from('slides')
    .select('id, slide_name, metadata, created_at')
    .eq('parent_id', folderId)
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
      'id, presentation_name, metadata, created_at, updated_at, tags, slides, settings, locked, version',
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

// Component for displaying individual slide
function SlideView({
  slide,
  organization,
  folderPath,
}: {
  slide: SlideDetail
  organization: Organization
  folderPath: string
}) {
  return (
    <>
      <OrgHeader organization={organization} />
      <SlideViewClient
        slide={slide}
        organization={organization}
        folderPath={folderPath}
      />
    </>
  )
}

// Component for displaying individual presentation
function PresentationView({
  presentation,
  organization,
  folderPath,
}: {
  presentation: PresentationDetail
  organization: Organization
  folderPath: string
}) {
  return (
    <>
      <OrgHeader organization={organization} />
      <PresentationViewClient
        presentation={presentation}
        organization={organization}
        folderPath={folderPath}
      />
    </>
  )
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

  const folderName = slug.join('/')
  return {
    title: `${folderName} - ${displayName}`,
    description: `Contents of ${folderName} in ${displayName}`,
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { organization: organizationName, slug } = await params

  // Step 1: Get organization
  const organization = await getOrganization(organizationName)
  if (!organization) {
    notFound()
  }

  // Check if this is a slide or presentation route
  const lastSegment = slug[slug.length - 1]
  const isSlideRoute = lastSegment?.endsWith('.slide')
  const isPresentationRoute = lastSegment?.endsWith('.presentation')

  if (isSlideRoute) {
    // Handle slide view
    const slideName = lastSegment.replace('.slide', '')
    const folderPath = slug.slice(0, -1).join('/')

    // Step 2: Get folder ID using the full path
    const folderId = await getFolderId(organization.id, folderPath)
    if (!folderId) {
      notFound()
    }

    // Step 3: Get slide data
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

    // Step 2: Get folder ID using the full path
    const folderId = await getFolderId(organization.id, folderPath)
    if (!folderId) {
      notFound()
    }

    // Step 3: Get presentation data
    const presentation = await getPresentationData(folderId, presentationName)
    if (!presentation) {
      notFound()
    }

    return (
      <PresentationView
        presentation={presentation}
        organization={organization}
        folderPath={folderPath}
      />
    )
  } else {
    // Handle folder view
    const folderPath = slug.join('/')

    // Step 2: Get folder ID using the full path
    const folderId = await getFolderId(organization.id, folderPath)
    if (!folderId) {
      notFound()
    }

    // Step 3: Get folder content
    const content = await getFolderContent(folderId)

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <OrgHeader organization={organization} />

          <div className="mt-8">
            {/* Breadcrumb with Actions */}
            <div className="mb-6 flex items-center justify-between">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <div>
                      <a
                        href={`/${organizationName}`}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <svg
                          className="h-5 w-5 flex-shrink-0"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="sr-only">Home</span>
                      </a>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 flex-shrink-0 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-4 text-sm font-medium text-gray-900">
                        {folderPath}
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>

              <div className="flex space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                >
                  <svg
                    className="mr-1.5 -ml-0.5 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                  New Folder
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <svg
                    className="mr-1.5 -ml-0.5 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload
                </button>
              </div>
            </div>

            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h2 className="text-xl font-semibold text-gray-900">
                  {folderPath}
                </h2>
                <p className="mt-2 text-sm text-gray-700">
                  {content.folders.length +
                    content.presentations.length +
                    content.slides.length ===
                  0
                    ? 'This folder is empty.'
                    : `${content.folders.length} folder${content.folders.length === 1 ? '' : 's'}, ${content.presentations.length} presentation${content.presentations.length === 1 ? '' : 's'}, ${content.slides.length} slide${content.slides.length === 1 ? '' : 's'}`}
                </p>
              </div>
            </div>

            <FolderContentList
              content={content}
              organizationName={organizationName}
              currentFolderPath={folderPath}
            />
          </div>
        </div>
      </div>
    )
  }
}
