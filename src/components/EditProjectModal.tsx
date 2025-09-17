'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { PencilIcon } from '@heroicons/react/24/outline'
import { updateProject } from '@/lib/project-actions'
import type { Enums, Tables } from '../../types/database.types'

type Project = Pick<
  Tables<'folders'>,
  'id' | 'folder_name' | 'metadata' | 'tags' | 'visibility'
>

interface FormData {
  folderName: string
  description: string
  tags: string
  visibility: Enums<'visibility_options'>
}

interface EditProjectModalProps {
  isOpen: boolean
  onClose: () => void
  organizationName: string
  project: Project | null
  onSuccess?: () => void
}

export default function EditProjectModal({
  isOpen,
  onClose,
  organizationName,
  project,
  onSuccess,
}: EditProjectModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      folderName: '',
      description: '',
      tags: '',
      visibility: 'internal',
    },
  })

  // Update form data when project changes
  useEffect(() => {
    if (project && isOpen) {
      const description =
        (project.metadata as { description?: string })?.description || ''
      const tags = project.tags?.join(', ') || ''

      setValue('folderName', project.folder_name)
      setValue('description', description)
      setValue('tags', tags)
      setValue('visibility', project.visibility || 'internal')
      setError(null)
    }
  }, [project, isOpen, setValue])

  const onSubmit = async (data: FormData) => {
    if (!project) return

    setLoading(true)
    setError(null)

    try {
      // Process tags
      const tags = data.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const result = await updateProject(organizationName, project.id, {
        folderName: data.folderName.trim(),
        description: data.description.trim() || undefined,
        tags: tags.length > 0 ? tags : [],
        visibility: data.visibility,
      })

      if (result.success) {
        onSuccess?.()
        onClose()
      } else {
        setError(result.error || 'Failed to update project')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setError(null)
      onClose()
    }
  }

  if (!project) return null

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
                    Edit Project
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
                        htmlFor="folderName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Project Name <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="folderName"
                          {...register('folderName', {
                            required: 'Project name is required',
                            pattern: {
                              value: /^[a-zA-Z0-9-_]+$/,
                              message:
                                'Project name can only contain letters, numbers, hyphens, and underscores',
                            },
                          })}
                          placeholder="my-awesome-project"
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                        />
                        {errors.folderName && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.folderName.message}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Only letters, numbers, hyphens, and underscores
                          allowed
                        </p>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Description
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="description"
                          rows={3}
                          {...register('description')}
                          placeholder="Brief description of the project..."
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                        />
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
                          {...register('tags')}
                          placeholder="web, mobile, api (comma-separated)"
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Separate multiple tags with commas
                        </p>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="visibility"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Visibility
                      </label>
                      <div className="mt-1">
                        <select
                          id="visibility"
                          {...register('visibility')}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                        >
                          <option value="internal">Internal</option>
                          <option value="restricted">Restricted</option>
                          <option value="public">Public</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Control who can access this project
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
