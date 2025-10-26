'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { publishDraft, discardDraft } from '@/lib/slide-actions'
import ConfirmDialog from './ConfirmDialog'
import Toast from './Toast'
import type { DraftReviewModalProps } from '@/types'

export default function DraftReviewModal({
  isOpen,
  onClose,
  slide,
  organizationName,
  folderPath,
  publishedImageUrl,
  draftImageUrl,
  onSuccess,
}: DraftReviewModalProps) {
  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)
  const [isDiscarding, setIsDiscarding] = useState(false)
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [toast, setToast] = useState<{
    show: boolean
    message: string
    variant: 'success' | 'error'
  }>({
    show: false,
    message: '',
    variant: 'success',
  })

  const handlePublish = async () => {
    setIsPublishing(true)
    setShowPublishConfirm(false)

    const result = await publishDraft(slide.id)

    setIsPublishing(false)

    if (result.success) {
      setToast({
        show: true,
        message: 'Draft published successfully.',
        variant: 'success',
      })

      // Wait a moment for the toast to show, then close modal and refresh
      setTimeout(() => {
        onClose()
        onSuccess()
        router.refresh()
      }, 1000)
    } else {
      setToast({
        show: true,
        message: result.error || 'Failed to publish draft. Please try again.',
        variant: 'error',
      })
    }
  }

  const handleDiscard = async () => {
    setIsDiscarding(true)
    setShowDiscardConfirm(false)

    const result = await discardDraft(slide.id)

    setIsDiscarding(false)

    if (result.success) {
      setToast({
        show: true,
        message: 'Draft discarded.',
        variant: 'success',
      })

      // Wait a moment for the toast to show, then close modal and refresh
      setTimeout(() => {
        onClose()
        onSuccess()
        router.refresh()
      }, 1000)
    } else {
      setToast({
        show: true,
        message: result.error || 'Failed to discard draft. Please try again.',
        variant: 'error',
      })
    }
  }

  const handleClose = () => {
    if (!isPublishing && !isDiscarding) {
      onClose()
    }
  }

  return (
    <>
      <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
        <DialogBackdrop
          transition
          className="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="relative h-[90vh] w-full max-w-[95vw] transform overflow-hidden rounded-lg bg-white shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              {/* Header */}
              <div className="border-b border-gray-200 bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg leading-6 font-semibold text-gray-900">
                    Review Draft: {slide.file_name}
                  </DialogTitle>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                    onClick={handleClose}
                    disabled={isPublishing || isDiscarding}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Content - Side by Side Comparison */}
              <div className="grid h-[calc(90vh-180px)] grid-cols-1 gap-8 overflow-y-auto p-8 lg:grid-cols-2">
                {/* Left Column - Published Version */}
                <div className="flex flex-col">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">
                      Currently Published
                    </h3>
                  </div>
                  <div className="flex-1 overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-50 shadow-sm">
                    <img
                      src={publishedImageUrl}
                      alt={`Published version of ${slide.file_name}`}
                      className="h-full w-full object-contain p-2"
                    />
                  </div>
                </div>

                {/* Right Column - Draft Version */}
                <div className="flex flex-col">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">
                      Unpublished Draft
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                      Draft
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden rounded-lg border-2 border-amber-400 bg-amber-50 shadow-sm">
                    {draftImageUrl ? (
                      <img
                        src={draftImageUrl}
                        alt={`Draft version of ${slide.file_name}`}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-gray-500">
                          Draft image not available
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer - Action Buttons */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={handleClose}
                    disabled={isPublishing || isDiscarding}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-700 shadow-sm ring-1 ring-red-300 ring-inset hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setShowDiscardConfirm(true)}
                    disabled={isPublishing || isDiscarding}
                  >
                    {isDiscarding ? 'Discarding...' : 'Discard Draft'}
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setShowPublishConfirm(true)}
                    disabled={isPublishing || isDiscarding}
                  >
                    {isPublishing ? 'Publishing...' : 'Publish Draft'}
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Publish Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showPublishConfirm}
        onClose={() => setShowPublishConfirm(false)}
        onConfirm={handlePublish}
        title="Publish Draft?"
        message="Are you sure you want to publish this draft? This will replace the currently published slide."
        confirmLabel="Publish"
        variant="info"
        loading={isPublishing}
      />

      {/* Discard Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        onConfirm={handleDiscard}
        title="Discard Draft?"
        message="Are you sure you want to discard this draft? All draft changes will be permanently lost."
        confirmLabel="Discard"
        variant="danger"
        loading={isDiscarding}
      />

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </>
  )
}
