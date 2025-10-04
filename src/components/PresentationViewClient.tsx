'use client'

import { useState } from 'react'
import { PencilIcon } from '@heroicons/react/24/outline'
import EditPresentationModal from './EditPresentationModal'
import SlideGallery from './SlideGallery'
import type { PresentationViewProps } from '@/types'

interface SlideData {
  order: number
  slide_id: string
  object_id: string
  imageUrl: string
}

interface PresentationViewClientProps extends PresentationViewProps {
  slideData: SlideData[]
}

export default function PresentationViewClient({
  presentation,
  organization,
  folderPath,
  canEdit = false,
  slideData,
}: PresentationViewClientProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isReorderMode, setIsReorderMode] = useState(false)

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
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold text-gray-900">
              {presentation.presentation_name}
            </h1>
          </div>
          {canEdit && (
            <div className="mt-4 flex space-x-2 sm:mt-0 sm:ml-4">
              {!isReorderMode && (
                <button
                  type="button"
                  onClick={() => setIsReorderMode(true)}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <svg
                    className="mr-1.5 -ml-0.5 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8h16M4 16h16"
                    />
                  </svg>
                  Reorder Slides
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <PencilIcon className="mr-1.5 -ml-0.5 h-4 w-4" />
                Edit Metadata
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Presentation Content */}
      <div className="rounded-lg bg-white shadow">
        <div className="p-6">
          {/* Slides Gallery */}
          <SlideGallery
            slides={slideData}
            organizationName={organization.organization_name}
            folderPath={folderPath}
            presentationName={presentation.presentation_name}
            presentationId={presentation.id}
            canEdit={canEdit}
            isReorderMode={isReorderMode}
            onExitReorderMode={() => setIsReorderMode(false)}
          />

          {/* Tags */}
          {presentation.tags && presentation.tags.length > 0 && (
            <div className="mb-6">
              {/* <h3 className="mb-3 text-lg font-medium text-gray-900">Tags</h3> */}
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
        </div>
      </div>

      {/* Edit Modal */}
      {canEdit && (
        <EditPresentationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          organizationName={organization.organization_name}
          presentation={presentation}
          folderPath={folderPath}
          onSuccess={() => {
            // Refresh the page to show updated data
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
