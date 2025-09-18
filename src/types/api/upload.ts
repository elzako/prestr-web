/**
 * Upload API types
 *
 * These types define the data structures used for file upload functionality,
 * including progress tracking and state management.
 */

// Upload progress information
export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

// Upload state management
export interface UploadState {
  isUploading: boolean
  progress: UploadProgress | null
  error: string | null
  success: boolean
}

// Upload result
export interface UploadResult {
  success: boolean
  fileUrl?: string
  fileName?: string
  fileSize?: number
  error?: string
}

// PowerPoint upload specific props
export interface PowerPointUploadProps {
  organizationId: string
  folderId: string
  onUploadStart?: () => void
  onUploadSuccess?: () => void
  onUploadError?: (error: string) => void
  className?: string
}

// Upload modal props
export interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  organizationId: string
  folderId: string
  onUploadSuccess?: () => void
}

// File upload configuration
export interface UploadConfig {
  maxFileSize: number // in bytes
  allowedTypes: string[]
  uploadUrl: string
  timeout: number // in milliseconds
}

// Upload event handlers
export interface UploadEventHandlers {
  onStart?: () => void
  onProgress?: (progress: UploadProgress) => void
  onSuccess?: (result: UploadResult) => void
  onError?: (error: string) => void
  onComplete?: () => void
}
