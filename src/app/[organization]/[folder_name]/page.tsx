import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '../../../../types/database.types'
import OrgHeader from '@/components/OrgHeader'
import FolderContentList from '@/components/FolderContentList'

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

interface PageProps {
  params: Promise<{
    organization: string
    folder_name: string
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

export async function generateMetadata({ params }: PageProps) {
  const { organization: organizationName, folder_name: folderName } =
    await params
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
    title: `${folderName} - ${displayName}`,
    description: `Contents of ${folderName} in ${displayName}`,
  }
}

export default async function FolderPage({ params }: PageProps) {
  const { organization: organizationName, folder_name: folderName } =
    await params

  // Step 1: Get organization
  const organization = await getOrganization(organizationName)
  if (!organization) {
    notFound()
  }

  // Step 2: Get folder ID using the full path
  const folderId = await getFolderId(organization.id, folderName)
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
          {/* Breadcrumb */}
          <nav className="mb-6 flex" aria-label="Breadcrumb">
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
                    {folderName}
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h2 className="text-xl font-semibold text-gray-900">
                {folderName}
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
          />
        </div>
      </div>
    </div>
  )
}
