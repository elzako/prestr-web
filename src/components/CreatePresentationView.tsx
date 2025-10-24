'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
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
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createPresentation } from '@/lib/presentation-actions'
import AddSlideToPresentationModal from './AddSlideToPresentationModal'
import type {
  CreatePresentationFormData,
  CreatePresentationViewProps,
} from '@/types'

interface SelectedSlide {
  slide_id: string
  object_id: string
  imageUrl: string
}

interface SortableSlideProps {
  slide: SelectedSlide
  index: number
  onRemove: () => void
}

function SortableSlide({ slide, index, onRemove }: SortableSlideProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.slide_id })

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
        isDragging ? 'z-50 shadow-lg' : ''
      }`}
    >
      {/* Slide Number Badge */}
      <div className="absolute top-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white shadow-sm">
        {index + 1}
      </div>

      {/* Drag Handle */}
      <button
        type="button"
        className="absolute top-2 right-10 z-10 cursor-move rounded-full bg-white/90 p-1.5 text-gray-400 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-indigo-100 hover:text-indigo-600"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <svg
          className="h-4 w-4"
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
        onClick={onRemove}
        className="absolute top-2 right-2 z-10 rounded-full bg-red-100 p-1.5 opacity-0 shadow-sm backdrop-blur-sm transition-colors group-hover:opacity-100 hover:bg-red-200"
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

      {/* Slide Image */}
      <div className="aspect-[16/9] overflow-hidden rounded-md bg-gray-100">
        <img
          src={slide.imageUrl}
          alt={`Slide ${index + 1}`}
          className="h-full w-full object-cover object-top transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />
      </div>
    </div>
  )
}

export default function CreatePresentationView({
  organization,
  folderId,
  folderPath,
  projectId,
  userRoles,
  onCancel,
  onSuccess,
}: CreatePresentationViewProps) {
  const [selectedSlides, setSelectedSlides] = useState<SelectedSlide[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAddSlideModalOpen, setIsAddSlideModalOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePresentationFormData>({
    defaultValues: {
      file_name: '',
      tags: '',
      slides: [],
    },
  })

  const handleAddSlides = (
    slides: Array<{ slide_id: string; object_id: string; imageUrl: string }>,
  ) => {
    setSelectedSlides([...selectedSlides, ...slides])
  }

  const handleRemoveSlide = (slideId: string) => {
    setSelectedSlides(selectedSlides.filter((s) => s.slide_id !== slideId))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSelectedSlides((items) => {
        const oldIndex = items.findIndex((item) => item.slide_id === active.id)
        const newIndex = items.findIndex((item) => item.slide_id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const onSubmit = async (data: CreatePresentationFormData) => {
    if (selectedSlides.length === 0) {
      setError('Please select at least one slide')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const tags = data.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      await createPresentation(
        folderId,
        data.file_name.trim(),
        tags,
        selectedSlides.map((slide) => ({
          slide_id: slide.slide_id,
          object_id: slide.object_id,
        })),
      )

      onSuccess()
    } catch (err) {
      console.error('Create presentation error:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to create presentation',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Presentation
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                in {folderPath || 'project root'}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSaving}
                className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSaving || selectedSlides.length === 0}
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? 'Creating...' : 'Create Presentation'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Presentation Details Form */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Presentation Details
          </h2>
          <form className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="file_name"
                className="block text-sm font-medium text-gray-700"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="file_name"
                {...register('file_name', {
                  required: 'Presentation name is required',
                  pattern: {
                    value: /^[a-zA-Z0-9-_]+$/,
                    message:
                      'Only letters, numbers, hyphens, and underscores allowed',
                  },
                })}
                placeholder="my-presentation"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm"
              />
              {errors.file_name && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.file_name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700"
              >
                Tags
              </label>
              <input
                type="text"
                id="tags"
                {...register('tags')}
                placeholder="marketing, sales, Q4 (comma-separated)"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate multiple tags with commas
              </p>
            </div>
          </form>
        </div>

        {/* Slides Section */}
        <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Slides</h2>
            <button
              type="button"
              onClick={() => setIsAddSlideModalOpen(true)}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <PlusIcon className="mr-1.5 -ml-0.5 h-5 w-5" aria-hidden="true" />
              Add Slide
            </button>
          </div>

          <div className="mt-6">
            {selectedSlides.length === 0 ? (
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No slides added
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding slides to your presentation.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddSlideModalOpen(true)}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <PlusIcon
                      className="mr-1.5 -ml-0.5 h-5 w-5"
                      aria-hidden="true"
                    />
                    Add your first slide
                  </button>
                </div>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={selectedSlides.map((s) => s.slide_id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {selectedSlides.map((slide, index) => (
                      <SortableSlide
                        key={slide.slide_id}
                        slide={slide}
                        index={index}
                        onRemove={() => handleRemoveSlide(slide.slide_id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>

      {/* Add Slide Modal */}
      <AddSlideToPresentationModal
        isOpen={isAddSlideModalOpen}
        onClose={() => setIsAddSlideModalOpen(false)}
        onAdd={handleAddSlides}
        organizationId={organization.id}
        projectId={projectId}
        excludeSlideIds={selectedSlides.map((s) => s.slide_id)}
        userRoles={userRoles}
      />
    </div>
  )
}
