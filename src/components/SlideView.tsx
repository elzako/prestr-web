'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { SlideViewProps } from '@/types'
import SlideEditForm from './SlideEditForm'
import DraftReviewModal from './DraftReviewModal'

export default function SlideView({
  slide,
  organization,
  folderPath,
  imageUrl,
  draftImageUrl,
  canEdit,
}: SlideViewProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [isDraftReviewOpen, setIsDraftReviewOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState({
    ...slide,
    description: slide.description || null,
  })
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const hasDraft = Boolean(slide.draft_object_id) && Boolean(draftImageUrl)

  const metadata =
    (slide.metadata as {
      slide_text?: string
      slideId?: number
      slideNumber?: number
      url?: string
      description?: string
      presentationTitle?: string
      presentationFileName?: string
    } | null) || null

  // Check URL parameter for lightbox mode
  useEffect(() => {
    const lightboxParam = searchParams.get('lightbox')
    if (lightboxParam === 'true') {
      setIsLightboxOpen(true)
    }
  }, [searchParams])

  // Update URL when lightbox state changes
  const toggleLightbox = () => {
    const newState = !isLightboxOpen
    setIsLightboxOpen(newState)

    const params = new URLSearchParams(searchParams.toString())
    if (newState) {
      params.set('lightbox', 'true')
    } else {
      params.delete('lightbox')
    }

    const newUrl = params.toString() ? `${pathname}?${params}` : pathname
    router.replace(newUrl, { scroll: false })
  }

  // Handle escape key to close lightbox and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        toggleLightbox()
      }
    }

    if (isLightboxOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when lightbox is open
      document.body.style.overflow = 'hidden'
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isLightboxOpen])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
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
                  {currentSlide.file_name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Slide Content */}
        <div className="rounded-lg bg-white shadow">
          <div className="p-3">
            {/* Header with action buttons */}
            <div className="mb-3 flex items-center justify-end space-x-2">
              {canEdit && hasDraft && (
                <button
                  onClick={() => setIsDraftReviewOpen(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 shadow-sm ring-1 ring-amber-300 ring-inset hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                  aria-label="Review draft"
                  title="This slide has an unpublished draft. Click to review changes."
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                  <span>Review Draft</span>
                </button>
              )}
              {canEdit && (
                <button
                  onClick={() => setIsEditFormOpen(true)}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  aria-label="Edit slide"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                </button>
              )}
              <button
                onClick={toggleLightbox}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                aria-label={isLightboxOpen ? 'Close lightbox' : 'Open lightbox'}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                  />
                </svg>
              </button>
            </div>

            {/* Slide image */}
            <div className="mb-6">
              <img
                src={imageUrl}
                alt={
                  metadata?.slide_text ||
                  `Slide image for ${currentSlide.file_name}`
                }
                className="w-full cursor-pointer rounded-md border border-gray-200 transition-opacity hover:opacity-90"
                onClick={toggleLightbox}
              />
            </div>

            {/* Slide Metadata */}
            {metadata?.slideNumber && (
              <div className="mb-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Slide Number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {metadata.slideNumber}
                  </dd>
                </div>
              </div>
            )}

            {/* Description */}
            {/* {currentSlide.description && (
              <div className="mb-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Description
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {currentSlide.description}
                  </dd>
                </div>
              </div>
            )} */}

            {/* Tags and Visibility */}
            {(currentSlide.tags && currentSlide.tags.length > 0) ||
            currentSlide.visibility ? (
              <div className="mb-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    {currentSlide.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {currentSlide.visibility && (
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          currentSlide.visibility === 'public'
                            ? 'bg-green-100 text-green-800'
                            : currentSlide.visibility === 'internal'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {currentSlide.visibility}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

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
            {metadata?.url && (
              <div className="mt-6 flex justify-end">
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Overlay */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          {/* Close Button */}
          <button
            onClick={toggleLightbox}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Close lightbox"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Slide Content */}
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img
              src={imageUrl}
              alt={
                metadata?.slide_text ||
                `Slide image for ${currentSlide.file_name}`
              }
              className="max-h-full max-w-full rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      <SlideEditForm
        slide={{
          id: currentSlide.id,
          file_name: currentSlide.file_name,
          description: currentSlide.description,
          tags: currentSlide.tags || [],
        }}
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        onSuccess={(updatedSlide) => {
          // Update current slide data
          setCurrentSlide((prev) => ({
            ...prev,
            file_name: updatedSlide.file_name,
            description: updatedSlide.description,
            tags: updatedSlide.tags,
          }))

          // If file_name changed, redirect to new URL
          if (updatedSlide.file_name !== slide.file_name) {
            const pathSegments = pathname.split('/')
            pathSegments[pathSegments.length - 1] = updatedSlide.file_name
            const newPath = pathSegments.join('/') + '.slide'
            router.push(newPath)
          }
        }}
      />

      {/* Draft Review Modal */}
      {hasDraft && draftImageUrl && (
        <DraftReviewModal
          isOpen={isDraftReviewOpen}
          onClose={() => setIsDraftReviewOpen(false)}
          slide={currentSlide}
          organizationName={organization.organization_name}
          folderPath={folderPath}
          publishedImageUrl={imageUrl}
          draftImageUrl={draftImageUrl}
          onSuccess={() => {
            // Refresh will be handled by the modal
          }}
        />
      )}
    </div>
  )
}
