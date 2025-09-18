'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { PencilIcon } from '@heroicons/react/24/outline'
import { updateFolder, getFolderById } from '@/lib/folder-actions'
import type { Folder, EditFolderFormData, EditFolderModalProps } from '@/types'

type FormData = EditFolderFormData

export default function EditFolderModal({
  isOpen,
  onClose,
  organizationName,
  folderId,
  onSuccess,
}: EditFolderModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [folder, setFolder] = useState<Folder | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      folderName: '',
      description: '',
      visibility: 'internal',
    },
  })

  const loadFolderData = useCallback(async () => {
    setInitialLoading(true)
    setError(null)

    try {
      const result = await getFolderById(folderId)
      if (result.success && result.folder) {
        setFolder(result.folder)
        const metadata = result.folder.metadata as {
          description?: string
        } | null
        reset({
          folderName: result.folder.folder_name,
          description: metadata?.description || '',
          visibility: result.folder.visibility || 'internal',
        })
      } else {
        setError(result.error || 'Failed to load folder data')
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load folder data',
      )
    } finally {
      setInitialLoading(false)
    }
  }, [folderId, reset])

  // Load folder data when modal opens
  useEffect(() => {
    if (isOpen && folderId) {
      loadFolderData()
    }
  }, [isOpen, folderId, loadFolderData])

  const onSubmit = async (data: FormData) => {
    if (!folder) return

    setLoading(true)
    setError(null)

    try {
      const result = await updateFolder(organizationName, folderId, {
        folderName:
          data.folderName.trim() !== folder.folder_name
            ? data.folderName.trim()
            : undefined,
        description: data.description.trim(),
        visibility:
          data.visibility !== folder.visibility ? data.visibility : undefined,
      })

      if (result.success) {
        reset()
        onSuccess?.()
        onClose()
      } else {
        setError(result.error || 'Failed to update folder')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update folder')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading && !initialLoading) {
      reset()
      setError(null)
      setFolder(null)
      onClose()
    }
  }

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
            {initialLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-sm text-gray-600">
                  Loading folder...
                </span>
              </div>
            ) : (
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
                      Edit Folder
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
                          Folder Name <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="folderName"
                            {...register('folderName', {
                              required: 'Folder name is required',
                              pattern: {
                                value: /^[a-z0-9-]+$/,
                                message:
                                  'Folder name can only contain lowercase letters, numbers, and hyphens',
                              },
                              minLength: {
                                value: 2,
                                message:
                                  'Folder name must be at least 2 characters long',
                              },
                              maxLength: {
                                value: 50,
                                message:
                                  'Folder name must be less than 50 characters',
                              },
                              validate: (value) => {
                                if (
                                  value.startsWith('-') ||
                                  value.endsWith('-')
                                ) {
                                  return 'Folder name cannot start or end with a hyphen'
                                }
                                return true
                              },
                            })}
                            placeholder="my-folder"
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                          />
                          {errors.folderName && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.folderName.message}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            Only lowercase letters, numbers, and hyphens allowed
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
                            placeholder="Brief description of the folder..."
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                          />
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
                            Control who can access this folder
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
                    {loading ? 'Updating...' : 'Update Folder'}
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
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
