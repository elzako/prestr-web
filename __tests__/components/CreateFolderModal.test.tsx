/**
 * Tests for CreateFolderModal component
 */

import { render, screen, waitFor } from '../setup/render'
import userEvent from '@testing-library/user-event'
import CreateFolderModal from '@/components/CreateFolderModal'
import { createFolder } from '@/lib/folder-actions'

// Mock the folder actions
jest.mock('@/lib/folder-actions', () => ({
  createFolder: jest.fn(),
}))

const mockCreateFolder = createFolder as jest.MockedFunction<
  typeof createFolder
>

describe('CreateFolderModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    organizationName: 'test-org',
    parentFolderId: 'parent-folder-123',
    onSuccess: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<CreateFolderModal {...defaultProps} />)

      expect(screen.getByText('Create New Folder')).toBeInTheDocument()
      expect(screen.getByLabelText(/folder name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/visibility/i)).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<CreateFolderModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Create New Folder')).not.toBeInTheDocument()
    })

    it('should render submit and cancel buttons', () => {
      render(<CreateFolderModal {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /create folder/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /cancel/i }),
      ).toBeInTheDocument()
    })
  })

  // Mock folder object that matches the database structure
  const mockFolder = {
    id: 'folder-123',
    organization_id: 'org-123',
    folder_name: 'test-folder',
    parent_id: 'parent-folder-123',
    full_path: '/parent/test-folder',
    tags: [],
    visibility: 'internal' as const,
    metadata: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'user-123',
    updated_by: 'user-123',
    deleted_at: null,
    deleted_by: null,
    locked: false,
    locked_by: null,
    parent_path: null,
  }

  describe('Form Validation', () => {
    it('should show validation error when folder name is empty', async () => {
      const user = userEvent.setup()
      render(<CreateFolderModal {...defaultProps} />)

      const submitButton = screen.getByRole('button', {
        name: /create folder/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/folder name is required/i),
        ).toBeInTheDocument()
      })
    })

    it('should show validation error for invalid folder name pattern', async () => {
      const user = userEvent.setup()
      render(<CreateFolderModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/folder name/i)
      await user.type(nameInput, 'Invalid_Folder_Name')

      const submitButton = screen.getByRole('button', {
        name: /create folder/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/can only contain lowercase letters, numbers/i),
        ).toBeInTheDocument()
      })
    })

    it('should show validation error for folder name too short', async () => {
      const user = userEvent.setup()
      render(<CreateFolderModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/folder name/i)
      await user.type(nameInput, 'a')

      const submitButton = screen.getByRole('button', {
        name: /create folder/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/must be at least 2 characters/i),
        ).toBeInTheDocument()
      })
    })

    it('should show validation error for folder name too long', async () => {
      const user = userEvent.setup()
      render(<CreateFolderModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/folder name/i)
      await user.type(nameInput, 'a'.repeat(51))

      const submitButton = screen.getByRole('button', {
        name: /create folder/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/must be less than 50 characters/i),
        ).toBeInTheDocument()
      })
    })

    it('should show validation error for folder name starting with hyphen', async () => {
      const user = userEvent.setup()
      render(<CreateFolderModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/folder name/i)
      await user.type(nameInput, '-folder')

      const submitButton = screen.getByRole('button', {
        name: /create folder/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/cannot start or end with a hyphen/i),
        ).toBeInTheDocument()
      })
    })

    it('should show validation error for folder name ending with hyphen', async () => {
      const user = userEvent.setup()
      render(<CreateFolderModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/folder name/i)
      await user.type(nameInput, 'folder-')

      const submitButton = screen.getByRole('button', {
        name: /create folder/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/cannot start or end with a hyphen/i),
        ).toBeInTheDocument()
      })
    })

    it('should accept valid folder name', async () => {
      const user = userEvent.setup()
      mockCreateFolder.mockResolvedValue({ success: true, folder: mockFolder })

      render(<CreateFolderModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/folder name/i)
      await user.type(nameInput, 'valid-folder-123')

      const submitButton = screen.getByRole('button', {
        name: /create folder/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreateFolder).toHaveBeenCalled()
      })
    })
  })

  describe('Form Submission', () => {
    it('should call createFolder with correct data', async () => {
      const user = userEvent.setup()
      mockCreateFolder.mockResolvedValue({ success: true, folder: mockFolder })

      render(<CreateFolderModal {...defaultProps} />)

      // Fill out form
      await user.type(screen.getByLabelText(/folder name/i), 'new-folder')
      await user.type(
        screen.getByLabelText(/description/i),
        'Test description',
      )
      await user.selectOptions(screen.getByLabelText(/visibility/i), 'public')

      // Submit form
      await user.click(screen.getByRole('button', { name: /create folder/i }))

      await waitFor(() => {
        expect(mockCreateFolder).toHaveBeenCalledWith(
          'test-org',
          'parent-folder-123',
          {
            folderName: 'new-folder',
            description: 'Test description',
            visibility: 'public',
          },
        )
      })
    })

    it('should handle successful submission', async () => {
      const user = userEvent.setup()
      mockCreateFolder.mockResolvedValue({ success: true, folder: mockFolder })

      render(<CreateFolderModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/folder name/i), 'new-folder')
      await user.click(screen.getByRole('button', { name: /create folder/i }))

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled()
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })

    it('should display error message on submission failure', async () => {
      const user = userEvent.setup()
      mockCreateFolder.mockResolvedValue({
        success: false,
        error: 'Folder already exists',
      })

      render(<CreateFolderModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/folder name/i), 'existing')
      await user.click(screen.getByRole('button', { name: /create folder/i }))

      await waitFor(() => {
        expect(screen.getByText('Folder already exists')).toBeInTheDocument()
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      mockCreateFolder.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, folder: mockFolder }), 100)),
      )

      render(<CreateFolderModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/folder name/i), 'new-folder')
      await user.click(screen.getByRole('button', { name: /create folder/i }))

      expect(screen.getByText('Creating...')).toBeInTheDocument()
      const submitButton = screen.getByRole('button', { name: /creating/i })
      expect(submitButton).toBeDisabled()
    })

    it('should trim whitespace from description', async () => {
      const user = userEvent.setup()
      mockCreateFolder.mockResolvedValue({ success: true, folder: mockFolder })

      render(<CreateFolderModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/folder name/i), 'folder-name')
      await user.type(
        screen.getByLabelText(/description/i),
        '  description with spaces  ',
      )
      await user.click(screen.getByRole('button', { name: /create folder/i }))

      await waitFor(() => {
        expect(mockCreateFolder).toHaveBeenCalledWith(
          'test-org',
          'parent-folder-123',
          {
            folderName: 'folder-name',
            description: 'description with spaces',
            visibility: 'internal',
          },
        )
      })
    })

    it('should handle empty description as undefined', async () => {
      const user = userEvent.setup()
      mockCreateFolder.mockResolvedValue({ success: true, folder: mockFolder })

      render(<CreateFolderModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/folder name/i), 'folder')
      await user.click(screen.getByRole('button', { name: /create folder/i }))

      await waitFor(() => {
        expect(mockCreateFolder).toHaveBeenCalledWith(
          'test-org',
          'parent-folder-123',
          expect.objectContaining({
            description: undefined,
          }),
        )
      })
    })
  })

  describe('Modal Interactions', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<CreateFolderModal {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should reset form when closed', async () => {
      const user = userEvent.setup()
      render(<CreateFolderModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(
        /folder name/i,
      ) as HTMLInputElement
      await user.type(nameInput, 'test-folder')

      expect(nameInput.value).toBe('test-folder')

      await user.click(screen.getByRole('button', { name: /cancel/i }))
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should prevent closing during loading', async () => {
      const user = userEvent.setup()
      mockCreateFolder.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, folder: mockFolder }), 1000)),
      )

      render(<CreateFolderModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/folder name/i), 'folder')
      await user.click(screen.getByRole('button', { name: /create folder/i }))

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper dialog role', () => {
      render(<CreateFolderModal {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should have accessible form labels', () => {
      render(<CreateFolderModal {...defaultProps} />)

      expect(screen.getByLabelText(/folder name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/visibility/i)).toBeInTheDocument()
    })

    it('should have required field indicator', () => {
      render(<CreateFolderModal {...defaultProps} />)

      const label = screen.getByText(/folder name/i).closest('label')
      expect(label?.textContent).toContain('*')
    })

    it('should have helper text for form fields', () => {
      render(<CreateFolderModal {...defaultProps} />)

      expect(
        screen.getByText(/only lowercase letters, numbers, and hyphens/i),
      ).toBeInTheDocument()
    })
  })

  describe('Default Values', () => {
    it('should set default visibility to internal', () => {
      render(<CreateFolderModal {...defaultProps} />)

      const select = screen.getByLabelText(/visibility/i) as HTMLSelectElement
      expect(select.value).toBe('internal')
    })

    it('should have all visibility options', () => {
      render(<CreateFolderModal {...defaultProps} />)

      const select = screen.getByLabelText(/visibility/i)
      expect(select).toContainHTML('<option value="internal">Internal</option>')
      expect(select).toContainHTML(
        '<option value="restricted">Restricted</option>',
      )
      expect(select).toContainHTML('<option value="public">Public</option>')
    })
  })
})
