'use client'

import { createClient } from '@/lib/supabase/client'
import {
  updateOrganizationProfile,
  checkOrganizationNameAvailability,
} from '@/lib/organization-actions'
import type { Organization } from '@/types'
import type {
  OrganizationProfileFormData,
  OrganizationMetadata,
} from '@/types/forms/organization-profile'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

interface OrganizationProfileModalProps {
  isOpen: boolean
  onClose: () => void
  organization: Organization
  onSuccess: (updatedOrganization: Organization) => void
}

export default function OrganizationProfileModal({
  isOpen,
  onClose,
  organization,
  onSuccess,
}: OrganizationProfileModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nameChanged, setNameChanged] = useState(false)

  const metadata = organization.metadata as OrganizationMetadata | null

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setError: setFormError,
    clearErrors,
  } = useForm<OrganizationProfileFormData>({
    mode: 'onChange',
    defaultValues: {
      name: metadata?.name || '',
      about: metadata?.about || '',
      website: metadata?.website || '',
      location: metadata?.location || '',
      organization_name: organization.organization_name,
    },
  })

  const watchedOrgName = watch('organization_name')

  // Reset form when modal opens or organization changes
  useEffect(() => {
    if (isOpen) {
      reset({
        name: metadata?.name || '',
        about: metadata?.about || '',
        website: metadata?.website || '',
        location: metadata?.location || '',
        organization_name: organization.organization_name,
      })
      setError(null)
      setNameChanged(false)
    }
  }, [isOpen, organization, metadata, reset])

  // Check if organization name has changed
  useEffect(() => {
    setNameChanged(watchedOrgName !== organization.organization_name)
  }, [watchedOrgName, organization.organization_name])

  const onSubmit = async (data: OrganizationProfileFormData) => {
    console.log('Form submitted with data:', data)
    console.log('Form errors:', errors)
    setIsLoading(true)
    setError(null)
    clearErrors()

    try {
      // Check if organization name is available if it has changed
      if (nameChanged) {
        const nameCheck = await checkOrganizationNameAvailability(
          data.organization_name,
          organization.id,
        )

        if (!nameCheck.success) {
          throw new Error(
            nameCheck.error || 'Failed to check name availability',
          )
        }

        if (!nameCheck.available) {
          setFormError('organization_name', {
            type: 'manual',
            message: 'This organization name is already taken',
          })
          setIsLoading(false)
          return
        }
      }

      // Prepare the updated metadata
      const updatedMetadata: OrganizationMetadata = {
        ...metadata,
        name: data.name,
        about: data.about,
        website: data.website,
        location: data.location,
      }

      // Prepare update data
      const updateData = {
        metadata: updatedMetadata,
        ...(nameChanged && { organization_name: data.organization_name }),
      }

      const result = await updateOrganizationProfile(
        organization.id,
        updateData,
      )

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update organization profile')
      }

      onSuccess(result.data)
      onClose()

      // Navigate to new URL if organization name changed
      if (nameChanged) {
        router.push(`/${result.data.organization_name}`)
      }
    } catch (err) {
      console.error('Error updating organization profile:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update organization profile',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setError(null)
    setNameChanged(false)
    onClose()
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleCancel}>
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

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                    onClick={handleCancel}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-base leading-6 font-semibold text-gray-900"
                    >
                      Edit Organization Profile
                    </Dialog.Title>

                    {error && (
                      <div className="mt-4 rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <ExclamationTriangleIcon
                              className="h-5 w-5 text-red-400"
                              aria-hidden="true"
                            />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-red-800">
                              {error}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="mt-4 space-y-4"
                    >
                      {/* Organization URL */}
                      <div>
                        <label
                          htmlFor="organization_name"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          Organization URL
                        </label>
                        <div className="mt-2 flex">
                          <div className="flex shrink-0 items-center rounded-l-md bg-white px-3 text-base text-gray-500 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                            prestr.com/
                          </div>
                          <input
                            id="organization_name"
                            type="text"
                            {...register('organization_name', {
                              required: 'Organization name is required',
                              pattern: {
                                value: /^[a-z0-9-]+$/,
                                message:
                                  'Only lowercase letters, numbers, and hyphens are allowed',
                              },
                              minLength: {
                                value: 3,
                                message:
                                  'Organization name must be at least 3 characters',
                              },
                              maxLength: {
                                value: 50,
                                message:
                                  'Organization name must be less than 50 characters',
                              },
                            })}
                            placeholder="acme"
                            aria-invalid={
                              errors.organization_name ? 'true' : 'false'
                            }
                            aria-describedby={
                              errors.organization_name
                                ? 'organization_name-error'
                                : undefined
                            }
                            className="-ml-px block w-full grow rounded-r-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                        </div>
                        {errors.organization_name && (
                          <p
                            id="organization_name-error"
                            className="mt-1 text-sm text-red-600"
                          >
                            {errors.organization_name.message}
                          </p>
                        )}
                      </div>

                      {/* Display Name */}
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Organization Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          {...register('name', {
                            required: 'Organization name is required',
                            maxLength: {
                              value: 100,
                              message:
                                'Organization name must be less than 100 characters',
                            },
                          })}
                          aria-invalid={errors.name ? 'true' : 'false'}
                          aria-describedby={
                            errors.name ? 'name-error' : undefined
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="ACME Inc."
                        />
                        {errors.name && (
                          <p
                            id="name-error"
                            className="mt-1 text-sm text-red-600"
                          >
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      {/* About */}
                      <div>
                        <label
                          htmlFor="about"
                          className="block text-sm font-medium text-gray-700"
                        >
                          About
                        </label>
                        <textarea
                          id="about"
                          rows={3}
                          {...register('about', {
                            maxLength: {
                              value: 500,
                              message: 'About must be less than 500 characters',
                            },
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="Tell us about your organization..."
                        />
                        {errors.about && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.about.message}
                          </p>
                        )}
                      </div>

                      {/* Website */}
                      <div>
                        <label
                          htmlFor="website"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Website
                        </label>
                        <input
                          type="url"
                          id="website"
                          {...register('website', {
                            pattern: {
                              value: /^https?:\/\/.+/,
                              message:
                                'Please enter a valid URL starting with http:// or https://',
                            },
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="https://example.com"
                        />
                        {errors.website && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.website.message}
                          </p>
                        )}
                      </div>

                      {/* Location */}
                      <div>
                        <label
                          htmlFor="location"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Location
                        </label>
                        <input
                          type="text"
                          id="location"
                          {...register('location', {
                            maxLength: {
                              value: 100,
                              message:
                                'Location must be less than 100 characters',
                            },
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="New York, NY"
                        />
                        {errors.location && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.location.message}
                          </p>
                        )}
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={isLoading || !isDirty}
                          className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:ml-3 sm:w-auto"
                        >
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                          onClick={handleCancel}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
