'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Tables } from '../../types/database.types'

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
}

function FolderCard({
  folder,
  organizationName,
}: {
  folder: Folder
  organizationName: string
}) {
  const visibilityColors = {
    public: 'bg-green-100 text-green-800',
    private: 'bg-red-100 text-red-800',
    restricted: 'bg-yellow-100 text-yellow-800',
  }

  const visibilityColor = folder.visibility
    ? visibilityColors[folder.visibility]
    : 'bg-gray-100 text-gray-800'

  return (
    <Link
      href={`/${organizationName}/${folder.folder_name}`}
      className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
    >
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
            <h3 className="truncate text-lg font-semibold text-gray-900">
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

        {/* Visibility Badge */}
        {folder.visibility && (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${visibilityColor}`}
          >
            {folder.visibility}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium text-sky-600">Open folder →</span>
        <div className="text-xs text-gray-400">Folder</div>
      </div>
    </Link>
  )
}

function PresentationCard({ presentation }: { presentation: Presentation }) {
  const metadata = presentation.metadata as { description?: string } | null

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
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
            <h3 className="truncate text-lg font-semibold text-gray-900">
              {presentation.presentation_name}
            </h3>
          </div>

          {metadata?.description && (
            <p className="mt-1 ml-8 truncate text-sm text-gray-500">
              {metadata.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button className="text-sm font-medium text-sky-600 hover:text-sky-500">
          View presentation →
        </button>
        <div className="text-xs text-gray-400">
          {new Date(presentation.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

function SlideCard({ slide }: { slide: Slide }) {
  const metadata = slide.metadata as { textContent?: string[] } | null

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="truncate text-lg font-semibold text-gray-900">
              {slide.slide_name}
            </h3>
          </div>

          {metadata?.textContent && metadata.textContent.length > 0 && (
            <p className="mt-1 ml-8 truncate text-sm text-gray-500">
              {metadata.textContent[0]}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button className="text-sm font-medium text-sky-600 hover:text-sky-500">
          View slide →
        </button>
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
}: FolderContentListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')

  // Combine all content for filtering
  const allItems = [
    ...content.folders.map((f) => ({ ...f, type: 'folder' as const })),
    ...content.presentations.map((p) => ({
      ...p,
      type: 'presentation' as const,
    })),
    ...content.slides.map((s) => ({ ...s, type: 'slide' as const })),
  ]

  // Filter items based on search term and type
  const filteredItems = allItems.filter((item) => {
    let name = ''
    if (item.type === 'folder') {
      name = (item as any).folder_name
    } else if (item.type === 'presentation') {
      name = (item as any).presentation_name
    } else {
      name = (item as any).slide_name
    }

    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || item.type === selectedType

    return matchesSearch && matchesType
  })

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
      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search content
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              id="search"
              name="search"
              type="text"
              placeholder="Search folders, presentations, and slides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-10 leading-5 placeholder-gray-500 focus:border-sky-500 focus:placeholder-gray-400 focus:ring-1 focus:ring-sky-500 focus:outline-none sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:w-48">
          <label htmlFor="type" className="sr-only">
            Filter by type
          </label>
          <select
            id="type"
            name="type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
          >
            <option value="all">All types</option>
            <option value="folder">Folders</option>
            <option value="presentation">Presentations</option>
            <option value="slide">Slides</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      {(searchTerm || selectedType !== 'all') && (
        <div className="mb-4 text-sm text-gray-600">
          {filteredItems.length === 0
            ? 'No items match your filters'
            : `${filteredItems.length} of ${totalItems} items`}
        </div>
      )}

      {/* Content Sections */}
      {filteredItems.length > 0 ? (
        <div className="space-y-8">
          {/* Folders Section */}
          {(selectedType === 'all' || selectedType === 'folder') && (
            <>
              {content.folders.length > 0 &&
                content.folders.some((f) =>
                  f.folder_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()),
                ) && (
                  <div>
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Folders (
                      {
                        content.folders.filter((f) =>
                          f.folder_name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                        ).length
                      }
                      )
                    </h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {content.folders
                        .filter((f) =>
                          f.folder_name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                        )
                        .map((folder) => (
                          <FolderCard
                            key={folder.id}
                            folder={folder}
                            organizationName={organizationName}
                          />
                        ))}
                    </div>
                  </div>
                )}
            </>
          )}

          {/* Presentations Section */}
          {(selectedType === 'all' || selectedType === 'presentation') && (
            <>
              {content.presentations.length > 0 &&
                content.presentations.some((p) =>
                  p.presentation_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()),
                ) && (
                  <div>
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Presentations (
                      {
                        content.presentations.filter((p) =>
                          p.presentation_name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                        ).length
                      }
                      )
                    </h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {content.presentations
                        .filter((p) =>
                          p.presentation_name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                        )
                        .map((presentation) => (
                          <PresentationCard
                            key={presentation.id}
                            presentation={presentation}
                          />
                        ))}
                    </div>
                  </div>
                )}
            </>
          )}

          {/* Slides Section */}
          {(selectedType === 'all' || selectedType === 'slide') && (
            <>
              {content.slides.length > 0 &&
                content.slides.some((s) =>
                  s.slide_name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()),
                ) && (
                  <div>
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Slides (
                      {
                        content.slides.filter((s) =>
                          s.slide_name
                            ?.toLowerCase()
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                        ).length
                      }
                      )
                    </h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {content.slides
                        .filter((s) =>
                          s.slide_name
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                        )
                        .map((slide) => (
                          <SlideCard key={slide.id} slide={slide} />
                        ))}
                    </div>
                  </div>
                )}
            </>
          )}
        </div>
      ) : searchTerm || selectedType !== 'all' ? (
        <div className="py-12 text-center">
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
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No matching content
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : null}
    </div>
  )
}
