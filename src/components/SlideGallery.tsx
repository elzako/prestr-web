'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  updatePresentationContent,
  updatePresentation,
} from '@/lib/presentation-actions'
import AddSlideModal from './AddSlideModal'

interface SlideData {
  order: number
  slide_id: string
  object_id: string
  imageUrl: string
}

interface SlideGalleryProps {
  slides: SlideData[]
  organizationName: string
  organizationId: string
  folderPath: string
  presentationName: string
  presentationId?: string
  projectId?: string
  canEdit?: boolean
  isEditMode?: boolean
  onExitEditMode?: () => void
  presentationTags?: string[]
}

interface SortableSlideProps {
  slide: SlideData
  index: number
  isEditMode: boolean
  onClick: () => void
  onRemove?: () => void
}

function SortableSlide({
  slide,
  index,
  isEditMode,
  onClick,
  onRemove,
}: SortableSlideProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.slide_id, disabled: !isEditMode })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all duration-200 ${
        isEditMode
          ? 'hover:border-indigo-400 hover:shadow-lg'
          : 'cursor-pointer hover:border-indigo-300 hover:shadow-md'
      } ${isDragging ? 'z-50' : ''}`}
      onClick={!isEditMode ? onClick : undefined}
    >
      {/* Slide Number Badge */}
      <div className="absolute top-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm">
        {slide.order ?? index + 1}
      </div>

      {/* Edit Mode Controls */}
      {isEditMode && (
        <>
          {/* Drag Handle Icon */}
          <button
            type="button"
            className="absolute top-2 right-10 z-10 cursor-move rounded-full bg-white/90 p-1.5 shadow-sm backdrop-blur-sm transition-colors hover:bg-indigo-100"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <svg
              className="h-4 w-4 text-gray-600"
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
          </button>

          {/* Remove Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.()
            }}
            className="absolute top-2 right-2 z-10 rounded-full bg-red-100 p-1.5 shadow-sm backdrop-blur-sm transition-colors hover:bg-red-200"
            aria-label="Remove slide"
          >
            <svg
              className="h-4 w-4 text-red-600"
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
        </>
      )}

      {/* Slide Image */}
      <div className="aspect-[16/9] overflow-hidden rounded-md bg-gray-100">
        <img
          src={slide.imageUrl}
          alt={`Slide ${slide.order ?? index + 1}`}
          className="h-full w-full object-cover object-top transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Hover Overlay (only in normal mode) */}
      {!isEditMode && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-all duration-200 group-hover:bg-black/20">
          <div className="rounded-full bg-white/90 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <svg
              className="h-5 w-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SlideGallery({
  slides,
  organizationName,
  organizationId,
  folderPath,
  presentationName,
  presentationId,
  projectId,
  canEdit = false,
  isEditMode = false,
  onExitEditMode,
  presentationTags = [],
}: SlideGalleryProps) {
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number | null>(
    null,
  )
  const [editedSlides, setEditedSlides] = useState<SlideData[]>(slides)
  const [originalSlides, setOriginalSlides] = useState<SlideData[]>(slides)
  const [editedName, setEditedName] = useState(presentationName)
  const [editedTags, setEditedTags] = useState<string[]>(presentationTags)
  const [originalName, setOriginalName] = useState(presentationName)
  const [originalTags, setOriginalTags] = useState<string[]>(presentationTags)
  const [tagInput, setTagInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isAddSlideModalOpen, setIsAddSlideModalOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Update edited slides when slides prop changes or when entering edit mode
  useEffect(() => {
    setEditedSlides(slides)
    if (!isEditMode) {
      setOriginalSlides(slides)
    }
  }, [slides, isEditMode])

  // Update metadata when props change
  useEffect(() => {
    setEditedName(presentationName)
    setEditedTags(presentationTags)
    if (!isEditMode) {
      setOriginalName(presentationName)
      setOriginalTags(presentationTags)
    }
  }, [presentationName, presentationTags, isEditMode])

  // Save original state when entering edit mode
  useEffect(() => {
    if (isEditMode) {
      setOriginalSlides([...editedSlides])
      setOriginalName(editedName)
      setOriginalTags([...editedTags])
    }
  }, [isEditMode])

  // Handle URL parameter for direct slide access
  useEffect(() => {
    const slideParam = searchParams.get('slide')
    if (slideParam && slides) {
      const slideIndex = parseInt(slideParam, 10) - 1
      if (slideIndex >= 0 && slideIndex < slides.length) {
        setSelectedSlideIndex(slideIndex)
      }
    }
  }, [searchParams, slides])

  const openLightbox = (index: number) => {
    if (isEditMode) return
    setSelectedSlideIndex(index)
    // Update URL with slide parameter
    const params = new URLSearchParams(searchParams.toString())
    params.set('slide', (index + 1).toString())
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const closeLightbox = () => {
    setSelectedSlideIndex(null)
    // Remove slide parameter from URL
    const params = new URLSearchParams(searchParams.toString())
    params.delete('slide')
    const newUrl = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname
    router.push(newUrl, { scroll: false })
  }

  const navigateSlide = (direction: 'prev' | 'next') => {
    if (selectedSlideIndex === null) return

    let newIndex: number
    if (direction === 'prev') {
      newIndex =
        selectedSlideIndex === 0 ? slides.length - 1 : selectedSlideIndex - 1
    } else {
      newIndex =
        selectedSlideIndex === slides.length - 1 ? 0 : selectedSlideIndex + 1
    }

    setSelectedSlideIndex(newIndex)
    // Update URL
    const params = new URLSearchParams(searchParams.toString())
    params.set('slide', (newIndex + 1).toString())
    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedSlideIndex === null) return

      switch (event.key) {
        case 'Escape':
          closeLightbox()
          break
        case 'ArrowLeft':
          navigateSlide('prev')
          break
        case 'ArrowRight':
          navigateSlide('next')
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedSlideIndex])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setEditedSlides((items) => {
        const oldIndex = items.findIndex((item) => item.slide_id === active.id)
        const newIndex = items.findIndex((item) => item.slide_id === over.id)

        const newOrder = arrayMove(items, oldIndex, newIndex)
        // Update order numbers to be sequential
        return newOrder.map((slide, index) => ({
          ...slide,
          order: index + 1,
        }))
      })
    }
  }

  const handleRemoveSlide = (slideId: string) => {
    setEditedSlides((items) => {
      const filtered = items.filter((item) => item.slide_id !== slideId)
      // Update order numbers to be sequential
      return filtered.map((slide, index) => ({
        ...slide,
        order: index + 1,
      }))
    })
  }

  const handleAddSlides = (
    newSlides: Array<{ slide_id: string; object_id: string }>,
  ) => {
    setEditedSlides((items) => {
      const currentMaxOrder = items.length
      const slidesWithImages = newSlides.map((slide, index) => ({
        order: currentMaxOrder + index + 1,
        slide_id: slide.slide_id,
        object_id: slide.object_id,
        imageUrl: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${organizationId}/${slide.object_id}.jpg`,
      }))
      return [...items, ...slidesWithImages]
    })
  }

  const handleSaveEdit = async () => {
    if (!presentationId) {
      alert('Cannot save: Presentation ID is missing')
      return
    }

    if (!editedName.trim()) {
      alert('Presentation name cannot be empty')
      return
    }

    setIsSaving(true)
    try {
      // Update presentation metadata
      await updatePresentation(presentationId, {
        presentation_name: editedName.trim(),
        tags: editedTags,
      })

      // Update presentation content (slides)
      const slidesData = editedSlides.map((slide) => ({
        order: slide.order,
        slide_id: slide.slide_id,
        object_id: slide.object_id,
      }))

      await updatePresentationContent(presentationId, slidesData)

      setOriginalSlides([...editedSlides])
      setOriginalName(editedName)
      setOriginalTags([...editedTags])
      onExitEditMode?.()

      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error('Failed to save presentation:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedSlides([...originalSlides])
    setEditedName(originalName)
    setEditedTags([...originalTags])
    setTagInput('')
    onExitEditMode?.()
  }

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !editedTags.includes(trimmedTag)) {
      setEditedTags([...editedTags, trimmedTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedTags(editedTags.filter((tag) => tag !== tagToRemove))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const displaySlides = isEditMode ? editedSlides : slides
  const sortedSlides = [...displaySlides].sort((a, b) => a.order - b.order)

  if (!slides || slides.length === 0) {
    return (
      <div className="py-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No slides</h3>
        <p className="mt-1 text-sm text-gray-500">
          This presentation doesn&apos;t have any slides yet.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Edit Mode - Metadata Section */}
      {canEdit && isEditMode && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center">
            <div className="mr-3 rounded-full bg-indigo-100 p-2">
              <svg
                className="h-5 w-5 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Edit Mode Active
              </p>
              <p className="text-xs text-gray-600">
                Update presentation details and manage slides
              </p>
            </div>
          </div>

          {/* Presentation Name */}
          <div className="mb-4">
            <label
              htmlFor="presentation-name"
              className="block text-sm font-medium text-gray-700"
            >
              Presentation Name
            </label>
            <input
              type="text"
              id="presentation-name"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter presentation name"
            />
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700"
            >
              Tags
            </label>
            <div className="mt-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Add
                </button>
              </div>
              {editedTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {editedTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-gray-200"
                        aria-label={`Remove ${tag}`}
                      >
                        <svg
                          className="h-3 w-3"
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
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setIsAddSlideModalOpen(true)}
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Slide
            </button>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <svg
                      className="mr-1.5 -ml-0.5 h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide Grid */}
      <div className="mb-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedSlides.map((s) => s.slide_id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {sortedSlides.map((slide, index) => (
                <SortableSlide
                  key={slide.slide_id}
                  slide={slide}
                  index={index}
                  isEditMode={isEditMode}
                  onClick={() => openLightbox(index)}
                  onRemove={() => handleRemoveSlide(slide.slide_id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Lightbox Modal */}
      {selectedSlideIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
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

          {/* Previous Button */}
          <button
            onClick={() => navigateSlide('prev')}
            className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
            aria-label="Previous slide"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Next Button */}
          <button
            onClick={() => navigateSlide('next')}
            className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
            aria-label="Next slide"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Slide Content */}
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img
              src={slides[selectedSlideIndex].imageUrl}
              alt={`Slide ${slides[selectedSlideIndex].order || selectedSlideIndex + 1}`}
              className="max-h-full max-w-full rounded-lg shadow-2xl"
            />

            {/* Slide Info */}
            <div className="absolute bottom-4 left-4 rounded-lg bg-black/50 px-3 py-2 text-white backdrop-blur-sm">
              <p className="text-sm font-medium">
                Slide{' '}
                {slides[selectedSlideIndex].order || selectedSlideIndex + 1} of{' '}
                {slides.length}
              </p>
            </div>
          </div>

          {/* Slide Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedSlideIndex(index)
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('slide', (index + 1).toString())
                  router.push(`?${params.toString()}`, { scroll: false })
                }}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === selectedSlideIndex
                    ? 'bg-white'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add Slide Modal */}
      {canEdit && presentationId && projectId && (
        <AddSlideModal
          isOpen={isAddSlideModalOpen}
          onClose={() => setIsAddSlideModalOpen(false)}
          onAdd={handleAddSlides}
          organizationId={organizationId}
          projectId={projectId}
          presentationId={presentationId}
          excludeSlideIds={editedSlides.map((s) => s.slide_id)}
        />
      )}
    </>
  )
}
