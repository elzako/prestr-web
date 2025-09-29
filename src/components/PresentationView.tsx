import { getSlideImageUrl } from '@/lib/cloudinary'
import type { PresentationViewProps } from '@/types'
import SlideGallery from './SlideGallery'

export default async function PresentationView({
  presentation,
  organization,
  folderPath,
}: PresentationViewProps) {
  const metadata = presentation.metadata as {
    url?: string
    description?: string
  } | null

  const slides = presentation.slides as
    | {
        order: number
        slide_id: string
        object_id: string
        url?: string
      }[]
    | null

  // Prepare slide data with image URLs for client component
  const slideData =
    slides?.map((slide) => ({
      order: slide.order,
      slide_id: slide.slide_id,
      object_id: slide.object_id,
      imageUrl: getSlideImageUrl(
        organization.id,
        slide.slide_id,
        slide.object_id,
      ),
    })) || []

  const settings = presentation.settings as {
    pptxDownloadRole: string
    pdfDownloadRole: string
    chatRole: string
  } | null

  return (
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
          {/* <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold text-gray-900">
              {presentation.presentation_name}
            </h1>
            {metadata?.description && (
              <p className="mt-2 text-sm text-gray-700">
                {metadata.description}
              </p>
            )}
          </div> */}
        </div>
      </div>

      {/* Presentation Content */}
      <div className="rounded-lg bg-white shadow">
        <div className="p-6">
          {/* Presentation Metadata */}
          {/* <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Created Date
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(presentation.created_at).toLocaleDateString('en-US', {
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
                {new Date(presentation.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
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
          </div> */}

          {/* Slides Gallery */}
          <SlideGallery
            slides={slideData}
            organizationName={organization.organization_name}
            folderPath={folderPath}
            presentationName={presentation.presentation_name}
          />

          {/* Tags */}
          {presentation.tags && presentation.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-medium text-gray-900">Tags</h3>
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
          {/* <div className="mt-6 flex justify-end space-x-3">
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
          </div> */}
        </div>
      </div>
    </div>
  )
}
