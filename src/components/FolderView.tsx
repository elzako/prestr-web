'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Tables } from '../../types/database.types'
import FolderContentList from './FolderContentList'
import UploadModal from './UploadModal'
import CreateFolderModal from './CreateFolderModal'
import Breadcrumbs from './Breadcrumbs'

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

interface FolderViewProps {
  organization: Organization
  folderId: string
  folderPath: string
  content: FolderContent
  projectId: string | null
  subFolderIds: string[] | null
}

export default function FolderView({
  organization,
  folderId,
  folderPath,
  content,
  projectId,
  subFolderIds,
}: FolderViewProps) {
  const router = useRouter()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false)

  const handleUploadSuccess = () => {
    // Refresh the page to show the new upload
    router.refresh()
  }

  const handleFolderSuccess = () => {
    // Refresh the page to show the new folder
    router.refresh()
  }

  const openUploadModal = () => {
    setIsUploadModalOpen(true)
  }

  const closeUploadModal = () => {
    setIsUploadModalOpen(false)
  }

  const openCreateFolderModal = () => {
    setIsCreateFolderModalOpen(true)
  }

  const closeCreateFolderModal = () => {
    setIsCreateFolderModalOpen(false)
  }

  return (
    <div>
      <div className="mt-6">
        <Breadcrumbs organization={organization} currentPath={folderPath} />
      </div>

      <div className="mt-8">
        {/* Actions */}
        <div className="mb-6 flex items-center justify-between">
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

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={openCreateFolderModal}
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

        <FolderContentList
          content={content}
          organizationName={organization.organization_name}
          currentFolderPath={folderPath}
          organizationId={organization.id}
          currentFolderId={folderId}
          projectId={projectId}
          subFolderIds={subFolderIds}
        />
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={closeUploadModal}
        organizationId={organization.id}
        folderId={folderId}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={closeCreateFolderModal}
        organizationName={organization.organization_name}
        parentFolderId={folderId}
        onSuccess={handleFolderSuccess}
      />
    </div>
  )
}
