'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useDebounce } from '@/hooks/useDebounce'
import { searchSlides } from '@/lib/search-actions'
import type { SearchResult, UserRoles } from '@/types'

interface AddSlideToPresentationModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (
    slides: Array<{ slide_id: string; object_id: string; imageUrl: string }>,
  ) => void
  organizationId: string
  projectId: string | null
  excludeSlideIds?: string[]
  userRoles?: UserRoles | null
}

export default function AddSlideToPresentationModal({
  isOpen,
  onClose,
  onAdd,
  organizationId,
  projectId,
  excludeSlideIds = [],
  userRoles,
}: AddSlideToPresentationModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedSlideIds, setSelectedSlideIds] = useState<Set<string>>(
    new Set(),
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Search for slides
  useEffect(() => {
    if (!isOpen || !projectId) return

    const performSearch = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const query = debouncedSearchTerm.trim() || '*'
        const response = await searchSlides({
          organizationId,
          projectId,
          query,
          limit: 100,
          offset: 0,
          userRoles,
        })

        if (response.success && response.results) {
          // Filter out slides already in presentation
          const filteredResults = response.results.filter(
            (result) => !excludeSlideIds.includes(result.id),
          )
          setSearchResults(filteredResults)
        } else {
          setError(response.error || 'Failed to load slides')
          setSearchResults([])
        }
      } catch (err) {
        console.error('Error searching slides:', err)
        setError('Failed to load slides. Please try again.')
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [
    isOpen,
    organizationId,
    projectId,
    debouncedSearchTerm,
    excludeSlideIds,
    userRoles,
  ])

  const handleToggleSlide = (slideId: string) => {
    const newSelected = new Set(selectedSlideIds)
    if (newSelected.has(slideId)) {
      newSelected.delete(slideId)
    } else {
      newSelected.add(slideId)
    }
    setSelectedSlideIds(newSelected)
  }

  const handleAdd = () => {
    const slidesToAdd = searchResults
      .filter((result) => selectedSlideIds.has(result.id))
      .map((result) => ({
        slide_id: result.id,
        object_id: result.object_id,
        imageUrl: result.imageUrl || '',
      }))

    onAdd(slidesToAdd)
    setSelectedSlideIds(new Set())
    setSearchTerm('')
    onClose()
  }

  const handleClose = () => {
    setSelectedSlideIds(new Set())
    setSearchTerm('')
    onClose()
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Add Slides to Presentation
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-md text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MagnifyingGlassIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Search slides..."
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="max-h-96 overflow-y-auto">
                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {isLoading && (
                    <div className="flex items-center justify-center py-12">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
                    </div>
                  )}

                  {!isLoading && !error && searchResults.length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-sm text-gray-500">
                        No slides available to add.
                      </p>
                    </div>
                  )}

                  {!isLoading && !error && searchResults.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => handleToggleSlide(result.id)}
                          className={`relative rounded-lg border-2 p-2 transition-all ${
                            selectedSlideIds.has(result.id)
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          {/* Checkbox */}
                          <div className="absolute top-3 left-3 z-10">
                            <input
                              type="checkbox"
                              checked={selectedSlideIds.has(result.id)}
                              onChange={() => handleToggleSlide(result.id)}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            />
                          </div>

                          {/* Slide Image */}
                          <div className="aspect-[16/9] overflow-hidden rounded-md bg-gray-100">
                            {result.imageUrl ? (
                              <img
                                src={result.imageUrl}
                                alt={result.file_name || 'Slide'}
                                className="h-full w-full object-cover object-top"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <svg
                                  className="h-12 w-12 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Slide Info */}
                          {result.file_name && (
                            <p className="mt-2 truncate text-xs text-gray-700">
                              {result.file_name}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-5 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={selectedSlideIds.size === 0}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add{' '}
                    {selectedSlideIds.size > 0 && `(${selectedSlideIds.size})`}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
