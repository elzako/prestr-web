'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Tables } from '../../types/database.types'
import FolderContentList from './FolderContentList'
import UploadModal from './UploadModal'

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

interface FolderContent {
  folders: Folder[]
  presentations: Presentation[]
  slides: Slide[]
}

interface FolderViewClientProps {
  organization: Organization
  folderId: string
  folderPath: string
  content: FolderContent
}

export default function FolderViewClient({
  organization,
  folderId,
  folderPath,
  content,
}: FolderViewClientProps) {
  const router = useRouter()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  const handleUploadSuccess = () => {
    // Refresh the page to show the new upload
    router.refresh()
  }

  const openUploadModal = () => {
    setIsUploadModalOpen(true)
  }

  const closeUploadModal = () => {
    setIsUploadModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mt-8">
          {/* Breadcrumb with Actions */}
          <div className="mb-6 flex items-center justify-between">
            <nav className="flex" aria-label="Breadcrumb">
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
                onClick={openUploadModal}
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
            organizationName={organization.organization_name}
            currentFolderPath={folderPath}
            organizationId={organization.id}
          />
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={closeUploadModal}
        organizationId={organization.id}
        folderId={folderId}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  )
}
