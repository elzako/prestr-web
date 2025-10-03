'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

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
}

export default function SlideGallery({
  slides,
  organizationName,
  folderPath,
  presentationName,
}: SlideGalleryProps) {
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number | null>(
    null,
  )
  const router = useRouter()
  const searchParams = useSearchParams()

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
      {/* Slide Grid */}
      <div className="mb-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {slides
            .sort((a, b) => a.order - b.order)
            .map((slide, index) => (
              <div
                key={slide.slide_id}
                className="group relative cursor-pointer rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:shadow-md"
                onClick={() => openLightbox(index)}
              >
                {/* Slide Number Badge */}
                <div className="absolute top-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm">
                  {slide.order ?? index + 1}
                </div>

                {/* Slide Image */}
                <div className="aspect-[16/9] overflow-hidden rounded-md bg-gray-100">
                  <img
                    src={slide.imageUrl}
                    alt={`Slide ${slide.order ?? index + 1}`}
                    className="h-full w-full object-cover object-top transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Hover Overlay */}
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
              </div>
            ))}
        </div>
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
