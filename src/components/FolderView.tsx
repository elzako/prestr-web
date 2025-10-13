'use client'

import type { FolderViewProps } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Breadcrumbs from './Breadcrumbs'
import CreateFolderModal from './CreateFolderModal'
import CreatePresentationView from './CreatePresentationView'
import FolderContentList from './FolderContentList'
import UploadModal from './UploadModal'

export default function FolderView({
  organization,
  folderId,
  folderPath,
  content,
  projectId,
  subFolderIds,
  userRoles,
}: FolderViewProps) {
  const router = useRouter()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false)
  const [isCreatePresentationMode, setIsCreatePresentationMode] =
    useState(false)

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

  const openCreatePresentationMode = () => {
    setIsCreatePresentationMode(true)
  }

  const closeCreatePresentationMode = () => {
    setIsCreatePresentationMode(false)
  }

  const handlePresentationSuccess = () => {
    // Refresh the page to show the new presentation
    router.refresh()
    setIsCreatePresentationMode(false)
  }

  // If in create presentation mode, show the creation view
  if (isCreatePresentationMode) {
    return (
      <CreatePresentationView
        organization={organization}
        folderId={folderId}
        folderPath={folderPath}
        projectId={projectId}
        userRoles={userRoles}
        onCancel={closeCreatePresentationMode}
        onSuccess={handlePresentationSuccess}
      />
    )
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
              onClick={openCreatePresentationMode}
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Create Presentation
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
          userRoles={userRoles}
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
