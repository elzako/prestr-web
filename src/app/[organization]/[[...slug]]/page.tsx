import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '../../../../types/database.types'
import OrgHeader from '@/components/OrgHeader'
import ProjectList from '@/components/ProjectList'
import FolderViewClient from '@/components/FolderViewClient'

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
  const metadata = slide.metadata as {
    textContent?: string[]
    slideId?: number
    slideNumber?: number
    url?: string
    description?: string
    presentationTitle?: string
    presentationFileName?: string
  } | null

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
                    href={`/${organization.organization_name}`}
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
                  <a
                    href={`/${organization.organization_name}/${folderPath}`}
                    className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    {folderPath}
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
                    {slide.slide_name}
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Slide Header */}
          <div className="mb-6">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="sm:flex-auto">
                <h1 className="text-2xl font-bold text-gray-900">
                  {slide.slide_name}
                </h1>
                {metadata?.description && (
                  <p className="mt-2 text-sm text-gray-700">
                    {metadata.description}
                  </p>
                )}
              </div>
              {slide.visibility && (
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      slide.visibility === 'public'
                        ? 'bg-green-100 text-green-800'
                        : slide.visibility === 'private'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {slide.visibility}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Slide Content */}
          <div className="rounded-lg bg-white shadow">
            <div className="p-6">
              {/* Slide Metadata */}
              <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Created Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(slide.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Last Updated
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(slide.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
                {metadata?.slideNumber && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Slide Number
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {metadata.slideNumber}
                    </dd>
                  </div>
                )}
              </div>

              {/* Text Content */}
              {metadata?.textContent && metadata.textContent.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-medium text-gray-900">
                    Content
                  </h3>
                  <div className="prose max-w-none">
                    {metadata.textContent.map((content, index) => (
                      <p key={index} className="mb-2 text-gray-700">
                        {content}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {slide.tags && slide.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-medium text-gray-900">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {slide.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Presentation Context */}
              {metadata?.presentationTitle && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="mb-3 text-lg font-medium text-gray-900">
                    Presentation Context
                  </h3>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Presentation Title
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {metadata.presentationTitle}
                      </dd>
                    </div>
                    {metadata?.presentationFileName && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          File Name
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {metadata.presentationFileName}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <a
                  href={`/${organization.organization_name}/${folderPath}`}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                >
                  Back to Folder
                </a>
                {metadata?.url && (
                  <a
                    href={metadata.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    View Original
                    <svg
                      className="ml-1.5 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
  const metadata = presentation.metadata as {
    url?: string
    description?: string
  } | null

  const slides = presentation.slides as
    | {
        order: number
        slide_key: string
        object_id: string
        url?: string
      }[]
    | null

  const settings = presentation.settings as {
    pptxDownloadRole: string
    pdfDownloadRole: string
    chatRole: string
  } | null

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
                    href={`/${organization.organization_name}`}
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
                  <a
                    href={`/${organization.organization_name}/${folderPath}`}
                    className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    {folderPath}
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
                    {presentation.presentation_name}
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Presentation Header */}
          <div className="mb-6">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="sm:flex-auto">
                <h1 className="text-2xl font-bold text-gray-900">
                  {presentation.presentation_name}
                </h1>
                {metadata?.description && (
                  <p className="mt-2 text-sm text-gray-700">
                    {metadata.description}
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center space-x-3 sm:mt-0 sm:ml-16 sm:flex-none">
                {/* {presentation.locked && (
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                    <svg
                      className="mr-1 h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Locked
                  </span>
                )} */}
                {presentation.version && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    v{presentation.version}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Presentation Content */}
          <div className="rounded-lg bg-white shadow">
            <div className="p-6">
              {/* Presentation Metadata */}
              <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Created Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(presentation.created_at).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      },
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Last Updated
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(presentation.updated_at).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      },
                    )}
                  </dd>
                </div>
                {slides && slides.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Total Slides
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {slides.length} slide{slides.length === 1 ? '' : 's'}
                    </dd>
                  </div>
                )}
              </div>

              {/* Slides List */}
              {slides && slides.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-medium text-gray-900">
                    Slides
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {slides
                      .sort((a, b) => a.order - b.order)
                      .map((slide, index) => (
                        <div
                          key={slide.slide_key}
                          className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-600">
                                {slide.order || index + 1}
                              </div>
                              <span className="ml-3 text-sm font-medium text-gray-900">
                                Slide {slide.order || index + 1}
                              </span>
                            </div>
                            {slide.url && (
                              <a
                                href={slide.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-indigo-600 hover:text-indigo-500"
                              >
                                View
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {presentation.tags && presentation.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-medium text-gray-900">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {presentation.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Presentation Settings */}
              {/* {settings && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="mb-3 text-lg font-medium text-gray-900">
                    Access Settings
                  </h3>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        PDF Download
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 capitalize">
                        {settings.pdfDownloadRole.replace('_', ' ')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        PPTX Download
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 capitalize">
                        {settings.pptxDownloadRole.replace('_', ' ')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Chat Access
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 capitalize">
                        {settings.chatRole.replace('_', ' ')}
                      </dd>
                    </div>
                  </dl>
                </div>
              )} */}

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <a
                  href={`/${organization.organization_name}/${folderPath}`}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                >
                  Back to Folder
                </a>
                {metadata?.url && (
                  <a
                    href={metadata.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    View Original
                    <svg
                      className="ml-1.5 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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

    console.log('folderId', folderId)
    console.log('presentationName', presentationName)

    // Get presentation data
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
    // Handle nested folder navigation
    const currentPath = slug.join('/')
    const folderId = await getFolderId(organization.id, currentPath)

    if (!folderId) {
      notFound()
    }

    const folderContent = await getFolderContent(folderId)

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <OrgHeader organization={organization} />
          <FolderViewClient
            organization={organization}
            folderId={folderId}
            folderPath={currentPath}
            content={folderContent}
          />
        </div>
      </div>
    )
  }
}
