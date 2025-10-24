'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { updateSlide } from '@/lib/slide-actions'

interface SlideEditFormProps {
  slide: {
    id: string
    file_name: string | null
    description?: string | null
    tags: string[]
  }
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedSlide: any) => void
}

interface FormData {
  file_name: string
  description: string
  tags: string
}

export default function SlideEditForm({
  slide,
  isOpen,
  onClose,
  onSuccess,
}: SlideEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      file_name: slide.file_name || '',
      description: slide.description || '',
      tags: slide.tags.join(', '),
    },
  })

  const watchedValues = watch()

  // Reset form when slide changes
  useState(() => {
    if (slide) {
      setValue('file_name', slide.file_name || '')
      setValue('description', slide.description || '')
      setValue('tags', slide.tags.join(', '))
    }
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Process tags - split by comma and clean up
      const tagsArray = data.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      // Validate file_name format
      const slideNameRegex = /^[a-z0-9-]+$/
      if (!slideNameRegex.test(data.file_name)) {
        throw new Error(
          'Slide name must contain only lowercase letters, numbers, and dashes',
        )
      }

      // Validate max 5 tags
      if (tagsArray.length > 5) {
        throw new Error('Maximum 5 tags are allowed')
      }

      const updatedSlide = await updateSlide(slide.id, {
        file_name: data.file_name,
        description: data.description || undefined,
        tags: tagsArray,
      })

      onSuccess(updatedSlide)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update slide')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if form has changes
  const hasChanges =
    watchedValues.file_name !== (slide.file_name || '') ||
    watchedValues.description !== (slide.description || '') ||
    watchedValues.tags !== slide.tags.join(', ')

  // Check if save button should be disabled
  const isSaveDisabled = isSubmitting || !isValid || !hasChanges

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div
          className="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity"
          onClick={onClose}
        />

        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 w-full text-center sm:mt-0 sm:ml-0 sm:text-left">
              <h3 className="text-base leading-6 font-semibold text-gray-900">
                Edit Slide
              </h3>

              {error && (
                <div className="mt-2 rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-6 space-y-6"
              >
                {/* Slide Name */}
                <div>
                  <label
                    htmlFor="file_name"
                    className="block text-sm leading-6 font-medium text-gray-900"
                  >
                    Slide Name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="file_name"
                      {...register('file_name', {
                        required: 'Slide name is required',
                        pattern: {
                          value: /^[a-z0-9-]+$/,
                          message:
                            'Only lowercase letters, numbers, and dashes are allowed',
                        },
                      })}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
                      placeholder="slide-name"
                    />
                    {errors.file_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.file_name.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm leading-6 font-medium text-gray-900"
                  >
                    Description
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="description"
                      rows={3}
                      {...register('description', {
                        maxLength: {
                          value: 160,
                          message: 'Description must be 160 characters or less',
                        },
                      })}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
                      placeholder="Brief description of the slide..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label
                    htmlFor="tags"
                    className="block text-sm leading-6 font-medium text-gray-900"
                  >
                    Tags
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="tags"
                      {...register('tags', {
                        validate: (value) => {
                          if (!value) return true
                          const tagsArray = value
                            .split(',')
                            .map((tag) => tag.trim())
                            .filter((tag) => tag.length > 0)
                          return (
                            tagsArray.length <= 5 ||
                            'Maximum 5 tags are allowed'
                          )
                        },
                      })}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
                      placeholder="tag1, tag2, tag3 (max 5 tags)"
                    />
                    {errors.tags && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.tags.message}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      Separate tags with commas. Maximum 5 tags.
                    </p>
                  </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSaveDisabled}
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:ml-3 sm:w-auto"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
