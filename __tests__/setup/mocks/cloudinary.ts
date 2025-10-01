/**
 * Mock Cloudinary client for testing
 *
 * This provides mock implementations for Cloudinary operations
 * to avoid making real API calls during tests.
 */

export const mockCloudinaryUpload = jest.fn()
export const mockCloudinaryUrl = jest.fn()
export const mockCloudinaryDelete = jest.fn()

/**
 * Mock Cloudinary client
 */
export const mockCloudinaryClient = {
  uploader: {
    upload: mockCloudinaryUpload,
    destroy: mockCloudinaryDelete,
  },
  url: mockCloudinaryUrl,
  config: jest.fn(),
}

/**
 * Setup function to mock Cloudinary
 */
export function mockCloudinary() {
  jest.mock('cloudinary', () => ({
    v2: mockCloudinaryClient,
  }))
}

/**
 * Reset all Cloudinary mocks
 */
export function resetCloudinaryMocks() {
  mockCloudinaryUpload.mockClear()
  mockCloudinaryUrl.mockClear()
  mockCloudinaryDelete.mockClear()
}

/**
 * Mock successful upload response
 */
export const mockUploadResponse = {
  public_id: 'test/slide-1/object-1',
  secure_url: 'https://res.cloudinary.com/test/image/upload/test/slide-1/object-1.png',
  width: 1920,
  height: 1080,
  format: 'png',
  resource_type: 'image',
  created_at: new Date().toISOString(),
  bytes: 102400,
}

/**
 * Mock upload error response
 */
export const mockUploadError = {
  error: {
    message: 'Upload failed',
    http_code: 400,
  },
}
