'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { PencilIcon } from '@heroicons/react/24/outline'
import { updatePresentation } from '@/lib/presentation-actions'
import type {
  EditPresentationFormData,
  EditPresentationModalProps,
} from '@/types'

type FormData = EditPresentationFormData

export default function EditPresentationModal({
  isOpen,
  onClose,
  organizationName,
  presentation,
  folderPath,
  onSuccess,
  onNameChange,
}: EditPresentationModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      presentation_name: '',
      tags: '',
    },
  })

  // Update form data when presentation changes
  useEffect(() => {
    if (presentation && isOpen) {
      const tags = presentation.tags?.join(', ') || ''

      setValue('presentation_name', presentation.presentation_name)
      setValue('tags', tags)
      setError(null)
    }
  }, [presentation, isOpen, setValue])

  const onSubmit = async (data: FormData) => {
    if (!presentation) return

    setLoading(true)
    setError(null)

    try {
      // Process tags (max 5 tags)
      const tags = data.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .slice(0, 5) // Limit to 5 tags

      const nameChanged =
        data.presentation_name.trim() !== presentation.presentation_name
      const newName = data.presentation_name.trim()

      const result = await updatePresentation(presentation.id, {
        presentation_name: newName,
        tags: tags.length > 0 ? tags : [],
      })

      if (result) {
        onClose()

        // If name changed, redirect to new URL
        if (nameChanged) {
          const newUrl = `/${organizationName}/${folderPath}/${newName}.presentation`
          onNameChange?.(presentation.presentation_name, newName)
          router.push(newUrl)
        } else {
          // Only call onSuccess if name didn't change (to avoid page reload during redirect)
          onSuccess?.()
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update presentation',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setError(null)
      reset()
      onClose()
    }
  }

  if (!presentation) return null

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                  <PencilIcon
                    className="h-6 w-6 text-indigo-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <DialogTitle
                    as="h3"
                    className="text-base leading-6 font-semibold text-gray-900"
                  >
                    Edit Presentation
                  </DialogTitle>
                  <div className="mt-4 space-y-4">
                    {error && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                              Error
                            </h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>{error}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="presentation_name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Presentation Name{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="presentation_name"
                          {...register('presentation_name', {
                            required: 'Presentation name is required',
                            pattern: {
                              value: /^[a-z0-9-]+$/,
                              message:
                                'Presentation name can only contain lowercase letters, numbers, and hyphens',
                            },
                          })}
                          placeholder="my-awesome-presentation"
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                        />
                        {errors.presentation_name && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.presentation_name.message}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Only lowercase letters, numbers, and hyphens allowed
                        </p>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="tags"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Tags
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="tags"
                          {...register('tags', {
                            validate: {
                              maxTags: (value) => {
                                const tags = value
                                  .split(',')
                                  .map((tag) => tag.trim())
                                  .filter((tag) => tag.length > 0)
                                return (
                                  tags.length <= 5 || 'Maximum 5 tags allowed'
                                )
                              },
                            },
                          })}
                          placeholder="web, mobile, api (comma-separated, max 5)"
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                        />
                        {errors.tags && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.tags.message}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Separate multiple tags with commas (maximum 5 tags)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-3 sm:w-auto"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
