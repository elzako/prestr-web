/**
 * Tests for EditFolderModal component
 */

import { render, screen, waitFor } from '../setup/render'
import userEvent from '@testing-library/user-event'
import EditFolderModal from '@/components/EditFolderModal'
import { updateFolder, getFolderById } from '@/lib/folder-actions'
import type { Folder } from '@/types'

// Mock the folder actions
jest.mock('@/lib/folder-actions', () => ({
  updateFolder: jest.fn(),
  getFolderById: jest.fn(),
}))

const mockUpdateFolder = updateFolder as jest.MockedFunction<
  typeof updateFolder
>
const mockGetFolderById = getFolderById as jest.MockedFunction<
  typeof getFolderById
>

describe('EditFolderModal Component', () => {
  const mockFolder: Folder = {
    id: 'folder-123',
    organization_id: 'org-123',
    folder_name: 'existing-folder',
    parent_id: 'parent-123',
    full_path: '/parent/existing-folder',
    visibility: 'internal',
    metadata: {
      description: 'Existing folder description',
    },
    tags: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    deleted_at: null,
  }

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    organizationName: 'test-org',
    folderId: 'folder-123',
    onSuccess: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetFolderById.mockResolvedValue({
      success: true,
      folder: mockFolder as any,
    })
  })

  describe('Rendering', () => {
    it('should show loading state initially', () => {
      render(<EditFolderModal {...defaultProps} />)

      expect(screen.getByText('Loading folder...')).toBeInTheDocument()
    })

    it('should render form after loading folder data', async () => {
      render(<EditFolderModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Folder')).toBeInTheDocument()
      })

      expect(screen.getByLabelText(/folder name/i)).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<EditFolderModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Edit Folder')).not.toBeInTheDocument()
    })

    it('should load folder data when opened', async () => {
      render(<EditFolderModal {...defaultProps} />)

      await waitFor(() => {
        expect(mockGetFolderById).toHaveBeenCalledWith('folder-123')
      })
    })

    it('should populate form with folder data', async () => {
      render(<EditFolderModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Folder')).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText(
        /folder name/i,
      ) as HTMLInputElement
      const descInput = screen.getByLabelText(
        /description/i,
      ) as HTMLTextAreaElement
      const visibilitySelect = screen.getByLabelText(
        /visibility/i,
      ) as HTMLSelectElement

      expect(nameInput.value).toBe('existing-folder')
      expect(descInput.value).toBe('Existing folder description')
      expect(visibilitySelect.value).toBe('internal')
    })

    it('should handle folder without description', async () => {
      mockGetFolderById.mockResolvedValue({
        success: true,
        folder: { ...mockFolder, metadata: {} } as any,
      })

      render(<EditFolderModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Folder')).toBeInTheDocument()
      })

      const descInput = screen.getByLabelText(
        /description/i,
      ) as HTMLTextAreaElement
      expect(descInput.value).toBe('')
    })

    it('should display error when folder loading fails', async () => {
      mockGetFolderById.mockResolvedValue({
        success: false,
        error: 'Folder not found',
        folder: null,
      })

      render(<EditFolderModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Folder not found')).toBeInTheDocument()
      })
    })
  })

  describe('Form Validation', () => {
    it('should show validation error when folder name is empty', async () => {
      const user = userEvent.setup()
      render(<EditFolderModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Folder')).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText(/folder name/i)
      await user.clear(nameInput)

      const submitButton = screen.getByRole('button', {
        name: /update folder/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/folder name is required/i),
        ).toBeInTheDocument()
      })
    })

    it('should show validation error for invalid folder name', async () => {
      const user = userEvent.setup()
      render(<EditFolderModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Folder')).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText(/folder name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Invalid-Name-With-Caps')

      const submitButton = screen.getByRole('button', {
        name: /update folder/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/can only contain lowercase letters/i),
        ).toBeInTheDocument()
      })
    })

    it('should validate folder name length constraints', async () => {
      const user = userEvent.setup()
      render(<EditFolderModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Folder')).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText(/folder name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'a')

      const submitButton = screen.getByRole('button', {
        name: /update folder/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/must be at least 2 characters/i),
        ).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should call updateFolder with correct data', async () => {
      const user = userEvent.setup()
      mockUpdateFolder.mockResolvedValue({ success: true, folder: mockFolder as any })

      render(<EditFolderModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Folder')).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText(/folder name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'updated-folder')

      const descInput = screen.getByLabelText(/description/i)
      await user.clear(descInput)
      await user.type(descInput, 'Updated description')

      await user.click(screen.getByRole('button', { name: /update folder/i }))

      await waitFor(() => {
        expect(mockUpdateFolder).toHaveBeenCalledWith(
          'test-org',
          'folder-123',
          {
            folderName: 'updated-folder',
            description: 'Updated description',
            visibility: undefined,
          },
        )
      })
    })

    it('should only send changed fields to updateFolder', async () => {
      const user = userEvent.setup()
      mockUpdateFolder.mockResolvedValue({ success: true, folder: mockFolder as any })

      render(<EditFolderModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Folder')).toBeInTheDocument()
      })

      // Only change description
      const descInput = screen.getByLabelText(/description/i)
      await user.clear(descInput)
      await user.type(descInput, 'New description')

      await user.click(screen.getByRole('button', { name: /update folder/i }))

      await waitFor(() => {
        expect(mockUpdateFolder).toHaveBeenCalledWith(
          'test-org',
          'folder-123',
          expect.objectContaining({
            folderName: undefined,
            description: 'New description',
            visibility: undefined,
          }),
        )
      })
    })

    it('should handle successful update', async () => {
      const user = userEvent.setup()
      mockUpdateFolder.mockResolvedValue({ success: true, folder: mockFolder as any })

      render(<EditFolderModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Folder')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /update folder/i }))

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled()
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })

    it('should display error message on update failure', async () => {
      const user = userEvent.setup()
      mockUpdateFolder.mockResolvedValue({
        success: false,
        error: 'Folder name already exists',
      })

      render(<EditFolderModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Folder')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /update folder/i }))

      await waitFor(() => {
        expect(
          screen.getByText('Folder name already exists'),
        ).toBeInTheDocument()
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      mockUpdateFolder.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, folder: mockFolder as any }), 100)),
      )

      render(<EditFolderModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Folder')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /update folder/i }))

      expect(screen.getByText('Updating...')).toBeInTheDocument()
      const submitButton = screen.getByRole('button', { name: /updating/i })
      expect(submitButton).toBeDisabled()
    })

    it('should detect visibility changes', async () => {
      const user = userEvent.setup()
      mockUpdateFolder.mockResolvedValue({ success: true, folder: mockFolder as any })

      render(<EditFolderModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Folder')).toBeInTheDocument()
      })

      const visibilitySelect = screen.getByLabelText(/visibility/i)
      await user.selectOptions(visibilitySelect, 'public')

      await user.click(screen.getByRole('button', { name: /update folder/i }))

      await waitFor(() => {
        expect(mockUpdateFolder).toHaveBeenCalledWith(
          'test-org',
          'folder-123',
          expect.objectContaining({
            visibility: 'public',
          }),
        )
      })
    })
  })

  describe('Modal Interactions', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<EditFolderModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Folder')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should prevent closing during initial loading', async () => {
      mockGetFolderById.mockImplementation(
        () => new Promise<any>((resolve) => setTimeout(() => resolve({ success: true, folder: mockFolder }), 1000)),
      )

      render(<EditFolderModal {...defaultProps} />)

      expect(screen.getByText('Loading folder...')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()
    })

    it('should prevent closing during update', async () => {
      const user = userEvent.setup()
      mockUpdateFolder.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, folder: mockFolder as any }), 1000)),
      )

      render(<EditFolderModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Folder')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /update folder/i }))

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('Data Reloading', () => {
    it('should reload folder data when modal is reopened', async () => {
      const { rerender } = render(
        <EditFolderModal {...defaultProps} isOpen={false} />,
      )

      rerender(<EditFolderModal {...defaultProps} isOpen={true} />)

      await waitFor(() => {
        expect(mockGetFolderById).toHaveBeenCalled()
      })
    })

    it('should reload data when folderId changes', async () => {
      const { rerender } = render(<EditFolderModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Folder')).toBeInTheDocument()
      })

      rerender(
        <EditFolderModal {...defaultProps} folderId="different-folder-123" />,
      )

      await waitFor(() => {
        expect(mockGetFolderById).toHaveBeenCalledWith('different-folder-123')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper dialog role', async () => {
      render(<EditFolderModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('should have accessible form labels', async () => {
      render(<EditFolderModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/folder name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/visibility/i)).toBeInTheDocument()
      })
    })

    it('should have required field indicator', async () => {
      render(<EditFolderModal {...defaultProps} />)

      await waitFor(() => {
        const label = screen.getByText(/folder name/i).closest('label')
        expect(label?.textContent).toContain('*')
      })
    })
  })
})
