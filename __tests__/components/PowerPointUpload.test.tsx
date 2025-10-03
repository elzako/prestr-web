/**
 * Tests for PowerPointUpload component
 */

import { render, screen, waitFor, act } from '../setup/render'
import userEvent from '@testing-library/user-event'
import PowerPointUpload from '@/components/PowerPointUpload'

// Mock Supabase client
const mockGetUser = jest.fn()
const mockRpc = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    rpc: mockRpc,
  })),
}))

// Mock XMLHttpRequest
class MockXMLHttpRequest {
  public upload = {
    addEventListener: jest.fn(),
  }
  public addEventListener = jest.fn()
  public open = jest.fn()
  public send = jest.fn()
  public setRequestHeader = jest.fn()
  public status = 200
  public responseText = ''
}

describe('PowerPointUpload Component', () => {
  const defaultProps = {
    organizationId: 'org-123',
    folderId: 'folder-123',
  }

  let originalXMLHttpRequest: typeof XMLHttpRequest

  beforeAll(() => {
    originalXMLHttpRequest = global.XMLHttpRequest
    global.XMLHttpRequest = MockXMLHttpRequest as any
  })

  afterAll(() => {
    global.XMLHttpRequest = originalXMLHttpRequest
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })
    mockRpc.mockResolvedValue({
      data: 'internal',
      error: null,
    })
  })

  describe('Rendering', () => {
    it('should render file upload area', () => {
      render(<PowerPointUpload {...defaultProps} />)

      expect(screen.getByText(/choose powerpoint file/i)).toBeInTheDocument()
      expect(screen.getByText(/.pptx files up to 50mb/i)).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      const { container } = render(
        <PowerPointUpload {...defaultProps} className="custom-class" />,
      )

      const wrapper = container.querySelector('.custom-class')
      expect(wrapper).toBeInTheDocument()
    })

    it('should have hidden file input', () => {
      render(<PowerPointUpload {...defaultProps} />)

      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).toBeInTheDocument()
      expect(fileInput).toHaveClass('hidden')
    })

    it('should accept .pptx files', () => {
      render(<PowerPointUpload {...defaultProps} />)

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement
      expect(fileInput?.accept).toContain('.pptx')
    })
  })

  describe('File Selection', () => {
    it('should open file dialog when clicking upload area', async () => {
      const user = userEvent.setup()
      render(<PowerPointUpload {...defaultProps} />)

      const uploadArea = screen.getByText(/choose powerpoint file/i).closest(
        'button',
      )
      expect(uploadArea).toBeInTheDocument()

      // Note: We can't fully test file dialog opening in jsdom
      // but we can verify the button is clickable
      await user.click(uploadArea!)
    })

    it('should display selected file information', async () => {
      const user = userEvent.setup()
      render(<PowerPointUpload {...defaultProps} />)

      const file = new File(['test content'], 'presentation.pptx', {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      })

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('presentation.pptx')).toBeInTheDocument()
      })

      // File size should be displayed
      expect(screen.getByText(/MB/)).toBeInTheDocument()
    })

    it('should show remove button for selected file', async () => {
      const user = userEvent.setup()
      render(<PowerPointUpload {...defaultProps} />)

      const file = new File(['test content'], 'test.pptx', {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      })

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        const removeButton = screen.getByTitle('Remove file')
        expect(removeButton).toBeInTheDocument()
      })
    })

    it('should remove file when clicking remove button', async () => {
      const user = userEvent.setup()
      render(<PowerPointUpload {...defaultProps} />)

      const file = new File(['test'], 'test.pptx', {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      })

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('test.pptx')).toBeInTheDocument()
      })

      const removeButton = screen.getByTitle('Remove file')
      await user.click(removeButton)

      await waitFor(() => {
        expect(screen.queryByText('test.pptx')).not.toBeInTheDocument()
        expect(screen.getByText(/choose powerpoint file/i)).toBeInTheDocument()
      })
    })
  })

  describe('File Validation', () => {
    it('should reject non-pptx files', async () => {
      const user = userEvent.setup()
      render(<PowerPointUpload {...defaultProps} />)

      const file = new File(['test'], 'document.pdf', {
        type: 'application/pdf',
      })

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement

      // Use fireEvent instead of userEvent for file input
      const { fireEvent } = await import('@testing-library/react')
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      })
      fireEvent.change(fileInput)

      await waitFor(() => {
        expect(
          screen.getByText(/please select a powerpoint.*file only/i),
        ).toBeInTheDocument()
      })
    })

    it('should reject files larger than 50MB', async () => {
      const user = userEvent.setup()
      render(<PowerPointUpload {...defaultProps} />)

      // Create a file with a size larger than 50MB (without actually creating large content)
      const file = new File(['test'], 'large.pptx', {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      })

      // Override the size property to simulate a large file
      Object.defineProperty(file, 'size', {
        value: 51 * 1024 * 1024,
        writable: false,
      })

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement

      // Use fireEvent instead of userEvent for file input
      const { fireEvent } = await import('@testing-library/react')
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      })
      fireEvent.change(fileInput)

      await waitFor(() => {
        expect(
          screen.getByText(/file size must be less than 50MB/i),
        ).toBeInTheDocument()
      })
    })

    it('should accept valid .pptx file', async () => {
      const user = userEvent.setup()
      render(<PowerPointUpload {...defaultProps} />)

      const file = new File(['test content'], 'valid.pptx', {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      })

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('valid.pptx')).toBeInTheDocument()
      })

      // Should not show error
      expect(
        screen.queryByText(/please select a powerpoint/i),
      ).not.toBeInTheDocument()
    })

    it('should accept files with octet-stream mime type', async () => {
      const user = userEvent.setup()
      render(<PowerPointUpload {...defaultProps} />)

      const file = new File(['test'], 'file.pptx', {
        type: 'application/octet-stream',
      })

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('file.pptx')).toBeInTheDocument()
      })
    })
  })

  describe('Upload Button', () => {
    it('should show upload button after file selection', async () => {
      const user = userEvent.setup()
      render(<PowerPointUpload {...defaultProps} />)

      const file = new File(['test'], 'test.pptx', {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      })

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /upload powerpoint/i }),
        ).toBeInTheDocument()
      })
    })

    it('should not show upload button before file selection', () => {
      render(<PowerPointUpload {...defaultProps} />)

      expect(
        screen.queryByRole('button', { name: /upload powerpoint/i }),
      ).not.toBeInTheDocument()
    })

    it('should disable upload button during upload', async () => {
      const user = userEvent.setup()
      render(<PowerPointUpload {...defaultProps} />)

      const file = new File(['test'], 'test.pptx', {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      })

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement
      await user.upload(fileInput, file)

      const uploadButton = await screen.findByRole('button', {
        name: /upload powerpoint/i,
      })
      await user.click(uploadButton)

      await waitFor(() => {
        const disabledButton = screen.getByRole('button', {
          name: /uploading/i,
        })
        expect(disabledButton).toBeDisabled()
      })
    })
  })

  describe('Upload Callbacks', () => {
    it('should call onUploadStart when upload begins', async () => {
      const onUploadStart = jest.fn()
      const user = userEvent.setup()

      render(
        <PowerPointUpload {...defaultProps} onUploadStart={onUploadStart} />,
      )

      const file = new File(['test'], 'test.pptx', {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      })

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement
      await user.upload(fileInput, file)

      const uploadButton = await screen.findByRole('button', {
        name: /upload powerpoint/i,
      })
      await user.click(uploadButton)

      await waitFor(() => {
        expect(onUploadStart).toHaveBeenCalledTimes(1)
      })
    })

    it('should call onUploadSuccess on successful upload', async () => {
      const onUploadSuccess = jest.fn()
      const user = userEvent.setup()

      // Mock successful XHR
      const mockXHR = new MockXMLHttpRequest()
      mockXHR.status = 200
      ;(global.XMLHttpRequest as any) = jest.fn(() => mockXHR)

      // Simulate successful upload
      mockXHR.addEventListener.mockImplementation((event, callback) => {
        if (event === 'load') {
          setTimeout(() => {
            act(() => {
              callback()
            })
          }, 10)
        }
      })

      render(
        <PowerPointUpload
          {...defaultProps}
          onUploadSuccess={onUploadSuccess}
        />,
      )

      const file = new File(['test'], 'test.pptx', {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      })

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement
      await user.upload(fileInput, file)

      const uploadButton = await screen.findByRole('button', {
        name: /upload powerpoint/i,
      })
      await user.click(uploadButton)

      await waitFor(
        () => {
          expect(onUploadSuccess).toHaveBeenCalledTimes(1)
        },
        { timeout: 5000 },
      )
    })

    it('should call onUploadError on failed upload', async () => {
      const onUploadError = jest.fn()
      const user = userEvent.setup()

      // Mock failed XHR
      const mockXHR = new MockXMLHttpRequest()
      mockXHR.status = 500
      mockXHR.responseText = JSON.stringify({ message: 'Server error' })
      ;(global.XMLHttpRequest as any) = jest.fn(() => mockXHR)

      mockXHR.addEventListener.mockImplementation((event, callback) => {
        if (event === 'load') {
          setTimeout(() => act(() => callback()), 0)
        }
      })

      render(
        <PowerPointUpload {...defaultProps} onUploadError={onUploadError} />,
      )

      const file = new File(['test'], 'test.pptx', {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      })

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement
      await user.upload(fileInput, file)

      const uploadButton = await screen.findByRole('button', {
        name: /upload powerpoint/i,
      })
      await user.click(uploadButton)

      await waitFor(
        () => {
          expect(onUploadError).toHaveBeenCalledWith(expect.any(String))
        },
        { timeout: 3000 },
      )
    })
  })

  describe('Upload States', () => {
    it('should show success message after successful upload', async () => {
      const user = userEvent.setup()

      const mockXHR = new MockXMLHttpRequest()
      mockXHR.status = 200
      ;(global.XMLHttpRequest as any) = jest.fn(() => mockXHR)

      mockXHR.addEventListener.mockImplementation((event, callback) => {
        if (event === 'load') {
          setTimeout(() => act(() => callback()), 0)
        }
      })

      render(<PowerPointUpload {...defaultProps} />)

      const file = new File(['test'], 'test.pptx', {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      })

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement
      await user.upload(fileInput, file)

      const uploadButton = await screen.findByRole('button', {
        name: /upload powerpoint/i,
      })
      await user.click(uploadButton)

      await waitFor(
        () => {
          expect(screen.getByText(/upload successful/i)).toBeInTheDocument()
        },
        { timeout: 3000 },
      )
    })

    it('should show error message on upload failure', async () => {
      const user = userEvent.setup()

      const mockXHR = new MockXMLHttpRequest()
      mockXHR.status = 400
      mockXHR.responseText = JSON.stringify({
        message: 'Invalid file format',
      })
      ;(global.XMLHttpRequest as any) = jest.fn(() => mockXHR)

      mockXHR.addEventListener.mockImplementation((event, callback) => {
        if (event === 'load') {
          setTimeout(() => act(() => callback()), 0)
        }
      })

      render(<PowerPointUpload {...defaultProps} />)

      const file = new File(['test'], 'test.pptx', {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      })

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement
      await user.upload(fileInput, file)

      const uploadButton = await screen.findByRole('button', {
        name: /upload powerpoint/i,
      })
      await user.click(uploadButton)

      await waitFor(
        () => {
          expect(screen.getByText(/invalid file format/i)).toBeInTheDocument()
        },
        { timeout: 3000 },
      )
    })

    it('should show uploading text during upload', async () => {
      const user = userEvent.setup()

      // Mock XHR to simulate upload progress
      const mockXHR = new MockXMLHttpRequest()
      mockXHR.addEventListener.mockImplementation((event, callback) => {
        if (event === 'progress') {
          // Simulate progress event
          setTimeout(() => act(() => callback()), 10)
        }
      })
      mockXHR.upload.addEventListener.mockImplementation((event, callback) => {
        if (event === 'progress') {
          // Simulate upload progress
          const progressEvent = {
            lengthComputable: true,
            loaded: 50,
            total: 100,
          }
          setTimeout(() => act(() => callback(progressEvent)), 10)
        }
      })
      ;(global.XMLHttpRequest as any) = jest.fn(() => mockXHR)

      render(<PowerPointUpload {...defaultProps} />)

      const file = new File(['test'], 'test.pptx', {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      })

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement
      await user.upload(fileInput, file)

      const uploadButton = await screen.findByRole('button', {
        name: /upload powerpoint/i,
      })
      await user.click(uploadButton)

      await waitFor(() => {
        const uploadingTexts = screen.getAllByText(/uploading/i)
        expect(uploadingTexts.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Accessibility', () => {
    it('should have accessible file input', () => {
      render(<PowerPointUpload {...defaultProps} />)

      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).toBeInTheDocument()
      expect(fileInput).toHaveAttribute('accept')
    })

    it('should disable controls during upload', async () => {
      const user = userEvent.setup()
      render(<PowerPointUpload {...defaultProps} />)

      const file = new File(['test'], 'test.pptx', {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      })

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement
      await user.upload(fileInput, file)

      const uploadButton = await screen.findByRole('button', {
        name: /upload powerpoint/i,
      })
      await user.click(uploadButton)

      await waitFor(() => {
        const fileInputDisabled = document.querySelector('input[type="file"]')
        expect(fileInputDisabled).toBeDisabled()
      })
    })
  })
})
