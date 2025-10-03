'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline'
import PowerPointUpload from './PowerPointUpload'
import type { UploadModalProps } from '@/types'

export default function UploadModal({
  isOpen,
  onClose,
  organizationId,
  folderId,
  onUploadSuccess,
}: UploadModalProps) {
  const [isUploading, setIsUploading] = useState(false)

  // Reset upload state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setIsUploading(false)
    }
  }, [isOpen])

  const handleUploadStart = () => {
    setIsUploading(true)
  }

  const handleUploadSuccess = () => {
    setIsUploading(false)
    // Call the parent success handler
    onUploadSuccess?.()

    // Close the modal after a brief delay to show success state
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
    setIsUploading(false)
  }

  const handleClose = () => {
    if (!isUploading) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ArrowUpTrayIcon
                    className="h-6 w-6 text-indigo-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-4">
                  <DialogTitle
                    as="h3"
                    className="text-lg leading-6 font-semibold text-gray-900"
                  >
                    Upload PowerPoint
                  </DialogTitle>
                  <p className="text-sm text-gray-500">
                    Upload a .pptx file to this folder
                  </p>
                </div>
              </div>
              {!isUploading && (
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={handleClose}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Upload Component */}
            <div className="mt-5">
              <PowerPointUpload
                organizationId={organizationId}
                folderId={folderId}
                onUploadStart={handleUploadStart}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={isUploading}
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
