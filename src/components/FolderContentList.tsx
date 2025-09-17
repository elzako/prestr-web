'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Tables } from '../../types/database.types'
import ActionDropdown, { ActionItem } from './ActionDropdown'
import ConfirmDialog from './ConfirmDialog'
import UploadModal from './UploadModal'
import CreateFolderModal from './CreateFolderModal'
import EditFolderModal from './EditFolderModal'
import SearchResults from './SearchResults'
import { deleteFolder } from '@/lib/folder-actions'
import type { UserRoles } from '@/app/[organization]/[[...slug]]/page'
import {
  PencilIcon,
  FolderIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid'

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

interface FolderContentListProps {
  content: FolderContent
  organizationName: string
  currentFolderPath: string
  organizationId?: string
  currentFolderId?: string
  projectId?: string | null
  subFolderIds?: string[] | null
  userRoles?: UserRoles | null
}

interface ActionStates {
  deleteConfirm: {
    open: boolean
    item: {
      id: string
      name: string
      type: 'folder' | 'presentation' | 'slide'
    } | null
  }
  uploadModal: {
    open: boolean
    folderId: string | null
  }
  createFolderModal: {
    open: boolean
    parentFolderId: string | null
  }
  editFolderModal: {
    open: boolean
    folderId: string | null
  }
  search: {
    isSearchMode: boolean
    query: string
  }
}

function FolderCard({
  folder,
  organizationName,
  currentFolderPath,
  onDelete,
  onUpload,
  onEdit,
  onCreateSubfolder,
}: {
  folder: Folder
  organizationName: string
  currentFolderPath: string
  onDelete: (id: string, name: string) => void
  onUpload: (folderId: string) => void
  onEdit: (folderId: string) => void
  onCreateSubfolder: (parentFolderId: string) => void
}) {
  const visibilityColors = {
    public: 'bg-green-100 text-green-800',
    internal: 'bg-yellow-100 text-yellow-800',
    restricted: 'bg-red-100 text-red-800',
  }

  const visibilityColor = folder.visibility
    ? visibilityColors[folder.visibility]
    : 'bg-gray-100 text-gray-800'

  const actionItems: ActionItem[] = [
    {
      id: 'rename',
      label: 'Rename folder',
      icon: <PencilIcon className="h-5 w-5" />,
      onClick: () => onEdit(folder.id),
    },
    {
      id: 'create-subfolder',
      label: 'Create subfolder',
      icon: <FolderIcon className="h-5 w-5" />,
      onClick: () => onCreateSubfolder(folder.id),
    },
    {
      id: 'upload',
      label: 'Upload content',
      icon: <ArrowUpTrayIcon className="h-5 w-5" />,
      onClick: () => onUpload(folder.id),
    },
    {
      id: 'delete',
      label: 'Delete folder',
      icon: <TrashIcon className="h-5 w-5" />,
      onClick: () => onDelete(folder.id, folder.folder_name),
      variant: 'danger' as const,
    },
  ]

  return (
    <div className="group relative rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center">
            <svg
              className="mr-3 h-5 w-5 text-blue-500"
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
            <h3 className="text-lg font-semibold text-gray-900">
              {folder.folder_name}
            </h3>
          </div>

          {folder.full_path && (
            <p className="mt-1 ml-8 truncate text-sm text-gray-500">
              {folder.full_path}
            </p>
          )}

          {/* Tags */}
          {folder.tags && folder.tags.length > 0 && (
            <div className="mt-3 ml-8 flex flex-wrap gap-1">
              {folder.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800"
                >
                  {tag}
                </span>
              ))}
              {folder.tags.length > 3 && (
                <span className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                  +{folder.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Visibility Badge */}
          {folder.visibility && (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${visibilityColor}`}
            >
              {folder.visibility}
            </span>
          )}
          {/* Actions Menu */}
          <div className="opacity-0 transition-opacity group-hover:opacity-100">
            <ActionDropdown items={actionItems} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Link
          href={`/${organizationName}/${currentFolderPath ? `${currentFolderPath}/` : ''}${folder.folder_name}`}
          className="text-sm font-medium text-sky-600 hover:text-sky-800"
        >
          Open folder →
        </Link>
        <div className="text-xs text-gray-400">Folder</div>
      </div>
    </div>
  )
}

function PresentationCard({
  presentation,
  organizationName,
  currentFolderPath,
  onDelete,
}: {
  presentation: Presentation
  organizationName: string
  currentFolderPath: string
  onDelete: (id: string, name: string) => void
}) {
  const metadata = presentation.metadata as { description?: string } | null

  const actionItems: ActionItem[] = [
    {
      id: 'rename',
      label: 'Rename presentation',
      icon: <PencilIcon className="h-5 w-5" />,
      onClick: () => {}, // TODO: Implement rename functionality
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <DocumentDuplicateIcon className="h-5 w-5" />,
      onClick: () => {}, // TODO: Implement duplicate
    },
    {
      id: 'delete',
      label: 'Delete presentation',
      icon: <TrashIcon className="h-5 w-5" />,
      onClick: () => onDelete(presentation.id, presentation.presentation_name),
      variant: 'danger' as const,
    },
  ]

  return (
    <div className="group relative rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center">
            <svg
              className="mr-3 h-5 w-5 text-purple-500"
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
            <h3 className="text-lg font-semibold text-gray-900">
              {presentation.presentation_name}
            </h3>
          </div>

          {metadata?.description && (
            <p className="mt-1 ml-8 truncate text-sm text-gray-500">
              {metadata.description}
            </p>
          )}
        </div>
        {/* Actions Menu */}
        <div className="opacity-0 transition-opacity group-hover:opacity-100">
          <ActionDropdown items={actionItems} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Link
          href={`/${organizationName}/${currentFolderPath ? `${currentFolderPath}/` : ''}${presentation.presentation_name}.presentation`}
          className="text-sm font-medium text-sky-600 hover:text-sky-800"
        >
          View presentation →
        </Link>
        <div className="text-xs text-gray-400">
          {new Date(presentation.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

function SlideCard({
  slide,
  organizationName,
  currentFolderPath,
  onDelete,
}: {
  slide: Slide
  organizationName: string
  currentFolderPath: string
  onDelete: (id: string, name: string) => void
}) {
  const metadata = slide.metadata as { textContent?: string[] } | null

  const actionItems: ActionItem[] = [
    {
      id: 'rename',
      label: 'Rename slide',
      icon: <PencilIcon className="h-5 w-5" />,
      onClick: () => {}, // TODO: Implement rename functionality
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <DocumentDuplicateIcon className="h-5 w-5" />,
      onClick: () => {}, // TODO: Implement duplicate
    },
    {
      id: 'delete',
      label: 'Delete slide',
      icon: <TrashIcon className="h-5 w-5" />,
      onClick: () => onDelete(slide.id, slide.slide_name || ''),
      variant: 'danger' as const,
    },
  ]

  return (
    <div className="group relative rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center">
            <svg
              className="mr-3 h-5 w-5 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">
              {slide.slide_name || 'Untitled Slide'}
            </h3>
          </div>

          {metadata?.textContent && metadata.textContent.length > 0 && (
            <p className="mt-1 ml-8 truncate text-sm text-gray-500">
              {metadata.textContent[0]}
            </p>
          )}
        </div>
        {/* Actions Menu */}
        <div className="opacity-0 transition-opacity group-hover:opacity-100">
          <ActionDropdown items={actionItems} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Link
          href={`/${organizationName}/${currentFolderPath ? `${currentFolderPath}/` : ''}${slide.slide_name}.slide`}
          className="text-sm font-medium text-sky-600 hover:text-sky-800"
        >
          View slide →
        </Link>
        <div className="text-xs text-gray-400">
          {new Date(slide.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

export default function FolderContentList({
  content,
  organizationName,
  currentFolderPath,
  organizationId,
  currentFolderId,
  projectId,
  subFolderIds,
  userRoles,
}: FolderContentListProps) {
  const [actionStates, setActionStates] = useState<ActionStates>({
    deleteConfirm: { open: false, item: null },
    uploadModal: { open: false, folderId: null },
    createFolderModal: { open: false, parentFolderId: null },
    editFolderModal: { open: false, folderId: null },
    search: { isSearchMode: false, query: '' },
  })

  const handleDelete = (
    id: string,
    name: string,
    type: 'folder' | 'presentation' | 'slide',
  ) => {
    setActionStates({
      ...actionStates,
      deleteConfirm: { open: true, item: { id, name, type } },
    })
  }

  const handleUpload = (folderId: string) => {
    setActionStates({
      ...actionStates,
      uploadModal: { open: true, folderId },
    })
  }

  const handleEditFolder = (folderId: string) => {
    setActionStates({
      ...actionStates,
      editFolderModal: { open: true, folderId },
    })
  }

  const handleCreateSubfolder = (parentFolderId: string) => {
    setActionStates({
      ...actionStates,
      createFolderModal: { open: true, parentFolderId },
    })
  }

  const confirmDelete = async () => {
    const { item } = actionStates.deleteConfirm
    if (!item) return

    try {
      if (item.type === 'folder') {
        const result = await deleteFolder(organizationName, item.id)
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete folder')
        }
      } else {
        // TODO: Implement API calls for presentations and slides
        console.log(`Deleting ${item.type} ${item.id}`)
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
      }

      // Close dialog and refresh
      setActionStates({
        ...actionStates,
        deleteConfirm: { open: false, item: null },
      })

      // Refresh the page to show updated content
      window.location.reload()
    } catch (error) {
      console.error('Failed to delete item:', error)
      // You could show an error toast here instead of console.error
    }
  }

  const closeDeleteDialog = () => {
    setActionStates({
      ...actionStates,
      deleteConfirm: { open: false, item: null },
    })
  }

  const closeUploadModal = () => {
    setActionStates({
      ...actionStates,
      uploadModal: { open: false, folderId: null },
    })
  }

  const closeCreateFolderModal = () => {
    setActionStates({
      ...actionStates,
      createFolderModal: { open: false, parentFolderId: null },
    })
  }

  const closeEditFolderModal = () => {
    setActionStates({
      ...actionStates,
      editFolderModal: { open: false, folderId: null },
    })
  }

  const handleUploadSuccess = () => {
    // Close the modal
    closeUploadModal()
    // Refresh the page or update the state
    window.location.reload()
  }

  const handleFolderSuccess = () => {
    // Close any open folder modals
    setActionStates({
      ...actionStates,
      createFolderModal: { open: false, parentFolderId: null },
      editFolderModal: { open: false, folderId: null },
    })
    // Refresh the page to show updated content
    window.location.reload()
  }

  const activateSearchMode = () => {
    setActionStates({
      ...actionStates,
      search: {
        ...actionStates.search,
        isSearchMode: true,
      },
    })
  }

  const exitSearchMode = () => {
    setActionStates({
      ...actionStates,
      search: {
        isSearchMode: false,
        query: '',
      },
    })
  }

  const handleSearchQueryChange = (query: string) => {
    setActionStates({
      ...actionStates,
      search: {
        ...actionStates.search,
        query,
      },
    })
  }

  const totalItems =
    content.folders.length +
    content.presentations.length +
    content.slides.length

  if (totalItems === 0) {
    return (
      <div className="mt-6 py-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">Empty folder</h3>
        <p className="mt-1 text-sm text-gray-500">
          This folder doesn&apos;t contain any items yet.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6">
      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search slides by content, tags, or features..."
            value={actionStates.search.query}
            onChange={(e) => handleSearchQueryChange(e.target.value)}
            onFocus={activateSearchMode}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pr-10 pl-10 text-sm placeholder-gray-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
          />
          {actionStates.search.isSearchMode && actionStates.search.query && (
            <button
              onClick={exitSearchMode}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results or Content Sections */}
      {actionStates.search.isSearchMode && organizationId ? (
        <SearchResults
          organizationName={organizationName}
          organizationId={organizationId}
          projectId={projectId || null}
          subFolderIds={subFolderIds || null}
          searchQuery={actionStates.search.query}
          isSearchMode={actionStates.search.isSearchMode}
          userRoles={userRoles || null}
        />
      ) : (
        <div className="space-y-8">
          {/* Folders Section */}
          {content.folders.length > 0 && (
            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Folders ({content.folders.length})
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {content.folders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    organizationName={organizationName}
                    currentFolderPath={currentFolderPath}
                    onDelete={(id, name) => handleDelete(id, name, 'folder')}
                    onUpload={handleUpload}
                    onEdit={handleEditFolder}
                    onCreateSubfolder={handleCreateSubfolder}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Presentations Section */}
          {content.presentations.length > 0 && (
            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Presentations ({content.presentations.length})
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {content.presentations.map((presentation) => (
                  <PresentationCard
                    key={presentation.id}
                    presentation={presentation}
                    organizationName={organizationName}
                    currentFolderPath={currentFolderPath}
                    onDelete={(id, name) =>
                      handleDelete(id, name, 'presentation')
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Slides Section */}
          {content.slides.length > 0 && (
            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Slides ({content.slides.length})
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {content.slides.map((slide) => (
                  <SlideCard
                    key={slide.id}
                    slide={slide}
                    organizationName={organizationName}
                    currentFolderPath={currentFolderPath}
                    onDelete={(id, name) => handleDelete(id, name, 'slide')}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={actionStates.deleteConfirm.open}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title={`Delete ${actionStates.deleteConfirm.item?.type}`}
        message={`Are you sure you want to delete "${actionStates.deleteConfirm.item?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

      {/* Upload Modal */}
      {organizationId && actionStates.uploadModal.folderId && (
        <UploadModal
          isOpen={actionStates.uploadModal.open}
          onClose={closeUploadModal}
          organizationId={organizationId}
          folderId={actionStates.uploadModal.folderId}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {/* Create Folder Modal */}
      {actionStates.createFolderModal.parentFolderId && (
        <CreateFolderModal
          isOpen={actionStates.createFolderModal.open}
          onClose={closeCreateFolderModal}
          organizationName={organizationName}
          parentFolderId={actionStates.createFolderModal.parentFolderId}
          onSuccess={handleFolderSuccess}
        />
      )}

      {/* Edit Folder Modal */}
      {actionStates.editFolderModal.folderId && (
        <EditFolderModal
          isOpen={actionStates.editFolderModal.open}
          onClose={closeEditFolderModal}
          organizationName={organizationName}
          folderId={actionStates.editFolderModal.folderId}
          onSuccess={handleFolderSuccess}
        />
      )}
    </div>
  )
}
