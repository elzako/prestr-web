'use client'

import { useState, useRef } from 'react'
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/20/solid'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

interface PowerPointUploadProps {
  organizationId: string
  folderId: string
  onUploadStart?: () => void
  onUploadSuccess?: () => void
  onUploadError?: (error: string) => void
  className?: string
}

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

interface UploadState {
  isUploading: boolean
  progress: UploadProgress | null
  error: string | null
  success: boolean
}

export default function PowerPointUpload({
  organizationId,
  folderId,
  onUploadStart,
  onUploadSuccess,
  onUploadError,
  className = '',
}: PowerPointUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: null,
    error: null,
    success: false,
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Reset state
  const resetState = () => {
    setUploadState({
      isUploading: false,
      progress: null,
      error: null,
      success: false,
    })
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Validate file type
  const validateFile = (file: File): string | null => {
    // Check file extension
    if (!file.name.toLowerCase().endsWith('.pptx')) {
      return 'Please select a PowerPoint (.pptx) file only.'
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024 // 50MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 50MB.'
    }

    // Check MIME type
    const acceptedTypes = [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/octet-stream', // Some browsers might report this for .pptx
    ]
    if (!acceptedTypes.includes(file.type) && file.type !== '') {
      // Allow empty type as some browsers don't set it correctly
      return 'Invalid file type. Please select a valid PowerPoint file.'
    }

    return null
  }

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const error = validateFile(file)
    if (error) {
      setUploadState({
        isUploading: false,
        progress: null,
        error,
        success: false,
      })
      return
    }

    setSelectedFile(file)
    setUploadState({
      isUploading: false,
      progress: null,
      error: null,
      success: false,
    })
  }

  // Get current user from Supabase auth
  const getCurrentUser = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error || !user) {
        throw new Error('User not authenticated')
      }
      return user.id
    } catch (error) {
      throw new Error('Failed to get user authentication')
    }
  }

  // Upload file to API
  const uploadFile = async (file: File) => {
    try {
      // Get current user ID
      const userId = await getCurrentUser()

      // Get API base URL from environment or use relative path
      const apiBaseUrl = process.env.NEXT_PUBLIC_PRESTR_API_URL || ''
      const uploadUrl = `${apiBaseUrl}/api/presentations/upload`

      // Create query parameters
      const params = new URLSearchParams({
        organizationId: organizationId,
        folderId: folderId,
        userId: userId,
        presentationName: file.name,
      })

      const fullUrl = `${uploadUrl}?${params.toString()}`

      // Create XMLHttpRequest for progress tracking
      return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            }
            setUploadState((prev) => ({
              ...prev,
              progress,
            }))
          }
        })

        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText)
              reject(
                new Error(
                  errorData.message ||
                    `Upload failed with status ${xhr.status}`,
                ),
              )
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`))
            }
          }
        })

        // Handle errors
        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred during upload'))
        })

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was cancelled'))
        })

        // Prepare and send request
        xhr.open('POST', fullUrl)

        // Set headers
        xhr.setRequestHeader('Accept', 'application/json')

        // Create FormData and send file
        const formData = new FormData()
        formData.append('file', file)

        xhr.send(formData)
      })
    } catch (error) {
      throw error
    }
  }

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile || uploadState.isUploading) return

    // Call upload start callback
    onUploadStart?.()

    setUploadState({
      isUploading: true,
      progress: { loaded: 0, total: selectedFile.size, percentage: 0 },
      error: null,
      success: false,
    })

    try {
      await uploadFile(selectedFile)

      setUploadState({
        isUploading: false,
        progress: null,
        error: null,
        success: true,
      })

      // Call success callback
      onUploadSuccess?.()

      // Auto-reset after success
      setTimeout(resetState, 3000)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed'

      setUploadState({
        isUploading: false,
        progress: null,
        error: errorMessage,
        success: false,
      })

      // Call error callback
      onUploadError?.(errorMessage)
    }
  }

  // Trigger file selection
  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  // Get status display
  const getStatusDisplay = () => {
    if (uploadState.success) {
      return (
        <div className="flex items-center text-sm text-emerald-600">
          <CheckCircleIcon className="mr-1 h-4 w-4" />
          Upload successful!
        </div>
      )
    }

    if (uploadState.error) {
      return (
        <div className="flex items-center text-sm text-rose-600">
          <ExclamationTriangleIcon className="mr-1 h-4 w-4" />
          {uploadState.error}
        </div>
      )
    }

    if (uploadState.isUploading && uploadState.progress) {
      return (
        <div className="text-sm text-gray-600">
          <div className="mb-1 flex items-center justify-between">
            <span>Uploading...</span>
            <span>{uploadState.progress.percentage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${uploadState.progress.percentage}%` }}
            />
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploadState.isUploading}
      />

      {/* Upload area */}
      <div className="space-y-3">
        {/* File selection */}
        {!selectedFile ? (
          <button
            type="button"
            onClick={openFileDialog}
            disabled={uploadState.isUploading}
            className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 transition-colors hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowUpTrayIcon className="mb-2 h-8 w-8 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">
              Choose PowerPoint file
            </span>
            <span className="mt-1 text-xs text-gray-500">
              .pptx files up to 50MB
            </span>
          </button>
        ) : (
          <div className="flex items-center justify-between rounded-lg border bg-gray-50 p-4">
            <div className="flex min-w-0 flex-1 items-center">
              <ArrowUpTrayIcon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            {!uploadState.isUploading && !uploadState.success && (
              <button
                type="button"
                onClick={resetState}
                className="ml-3 p-1 text-gray-400 transition-colors hover:text-gray-600"
                title="Remove file"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Upload button */}
        {selectedFile && !uploadState.success && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploadState.isUploading}
            className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploadState.isUploading ? (
              <>
                <svg
                  className="mr-3 -ml-1 h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="mr-2 h-4 w-4" />
                Upload PowerPoint
              </>
            )}
          </button>
        )}

        {/* Status display */}
        {getStatusDisplay()}
      </div>
    </div>
  )
}
