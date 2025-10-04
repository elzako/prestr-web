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
import { reorderSlides } from '@/lib/presentation-actions'

interface SlideData {
  order: number
  slide_id: string
  object_id: string
  imageUrl: string
}

interface SlideGalleryProps {
  slides: SlideData[]
  organizationName: string
  folderPath: string
  presentationName: string
  presentationId?: string
  canEdit?: boolean
  isReorderMode?: boolean
  onExitReorderMode?: () => void
}

interface SortableSlideProps {
  slide: SlideData
  index: number
  isReorderMode: boolean
  onClick: () => void
}

function SortableSlide({
  slide,
  index,
  isReorderMode,
  onClick,
}: SortableSlideProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.slide_id, disabled: !isReorderMode })

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
        isReorderMode
          ? 'cursor-move hover:border-indigo-400 hover:shadow-lg'
          : 'cursor-pointer hover:border-indigo-300 hover:shadow-md'
      } ${isDragging ? 'z-50' : ''}`}
      onClick={!isReorderMode ? onClick : undefined}
      {...(isReorderMode ? { ...attributes, ...listeners } : {})}
    >
      {/* Slide Number Badge */}
      <div className="absolute top-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm">
        {slide.order ?? index + 1}
      </div>

      {/* Drag Handle Icon (visible in reorder mode) */}
      {isReorderMode && (
        <div className="absolute top-2 right-2 z-10 rounded-full bg-white/90 p-1.5 shadow-sm backdrop-blur-sm">
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
        </div>
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
      {!isReorderMode && (
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
  folderPath,
  presentationName,
  presentationId,
  canEdit = false,
  isReorderMode = false,
  onExitReorderMode,
}: SlideGalleryProps) {
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number | null>(
    null,
  )
  const [reorderedSlides, setReorderedSlides] = useState<SlideData[]>(slides)
  const [originalSlides, setOriginalSlides] = useState<SlideData[]>(slides)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Update reordered slides when slides prop changes or when entering reorder mode
  useEffect(() => {
    setReorderedSlides(slides)
    if (!isReorderMode) {
      setOriginalSlides(slides)
    }
  }, [slides, isReorderMode])

  // Save original slides when entering reorder mode
  useEffect(() => {
    if (isReorderMode) {
      setOriginalSlides([...reorderedSlides])
    }
  }, [isReorderMode])

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
    if (isReorderMode) return
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
      setReorderedSlides((items) => {
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

  const handleSaveReorder = async () => {
    if (!presentationId) {
      alert('Cannot save: Presentation ID is missing')
      return
    }

    setIsSaving(true)
    try {
      const slidesData = reorderedSlides.map((slide) => ({
        order: slide.order,
        slide_id: slide.slide_id,
        object_id: slide.object_id,
      }))

      await reorderSlides(presentationId, slidesData)

      setOriginalSlides([...reorderedSlides])
      onExitReorderMode?.()

      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error('Failed to save slide order:', error)
      alert('Failed to save slide order. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelReorder = () => {
    setReorderedSlides([...originalSlides])
    onExitReorderMode?.()
  }

  const displaySlides = isReorderMode ? reorderedSlides : slides
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
      {/* Reorder Mode Controls */}
      {canEdit && isReorderMode && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center">
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
                  d="M4 8h16M4 16h16"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Reorder Mode Active
              </p>
              <p className="text-xs text-gray-600">
                Drag slides to reorder, then save or cancel
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleCancelReorder}
              disabled={isSaving}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveReorder}
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
                'Save Order'
              )}
            </button>
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
                  isReorderMode={isReorderMode}
                  onClick={() => openLightbox(index)}
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
    </>
  )
}
