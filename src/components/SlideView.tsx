import { getSlideImageUrl } from '@/lib/cloudinary'
import type { SlideViewProps } from '@/types'
import OrgHeader from './OrgHeader'

export default async function SlideView({
  slide,
  organization,
  folderPath,
}: SlideViewProps) {
  const metadata =
    (slide.metadata as {
      textContent?: string[]
      slideId?: number
      slideNumber?: number
      url?: string
      description?: string
      presentationTitle?: string
      presentationFileName?: string
    } | null) || null

  // Construct Cloudinary image URL server-side
  const imageUrl = getSlideImageUrl(
    organization.id,
    String(slide.id),
    slide.object_id,
  )

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
                        : slide.visibility === 'internal'
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
              {/* Slide image */}
              <div className="mb-6">
                <img
                  src={imageUrl}
                  alt={`Slide image for ${slide.slide_name}`}
                  className="w-full rounded-md border border-gray-200"
                />
              </div>

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
