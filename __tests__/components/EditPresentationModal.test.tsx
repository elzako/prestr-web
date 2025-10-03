/**
 * Tests for EditPresentationModal component
 */

import { render, screen, waitFor } from '../setup/render'
import userEvent from '@testing-library/user-event'
import EditPresentationModal from '@/components/EditPresentationModal'
import { updatePresentation } from '@/lib/presentation-actions'
import { useRouter } from 'next/navigation'
import type { PresentationDetail } from '@/types'

// Mock the presentation actions
jest.mock('@/lib/presentation-actions', () => ({
  updatePresentation: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

const mockUpdatePresentation = updatePresentation as jest.MockedFunction<
  typeof updatePresentation
>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('EditPresentationModal Component', () => {
  const mockPresentation: PresentationDetail = {
    id: 'presentation-123',
    parent_id: 'folder-123',
    presentation_name: 'existing-presentation',
    tags: ['tag1', 'tag2'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    metadata: {},
    slides: [],
    settings: {
      pptxDownloadRole: 'organization-member',
      pdfDownloadRole: 'organization-member',
      chatRole: 'organization-member',
    },
    version: 1,
  }

  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    organizationName: 'test-org',
    presentation: mockPresentation,
    folderPath: 'folder1/folder2',
    onSuccess: jest.fn(),
    onNameChange: jest.fn(),
  }

  // Mock the return value from updatePresentation (full database row)
  const mockPresentationDbRow = {
    id: 'presentation-123',
    parent_id: 'folder-123',
    presentation_name: 'existing-presentation',
    tags: ['tag1', 'tag2'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'user-123',
    updated_by: 'user-123',
    deleted_at: null,
    deleted_by: null,
    metadata: {},
    slides: [],
    settings: {
      pptxDownloadRole: 'organization-member' as const,
      pdfDownloadRole: 'organization-member' as const,
      chatRole: 'organization-member' as const,
    },
    version: 1,
    locked: false,
    locked_by: null,
    change_description: null,
    sys_period: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue(mockRouter as any)
  })

  describe('Rendering', () => {
    it('should render when isOpen is true with presentation', () => {
      render(<EditPresentationModal {...defaultProps} />)

      expect(screen.getByText('Edit Presentation')).toBeInTheDocument()
      expect(screen.getByLabelText(/presentation name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<EditPresentationModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Edit Presentation')).not.toBeInTheDocument()
    })

    it('should not render when presentation is null', () => {
      render(<EditPresentationModal {...defaultProps} presentation={null as any} />)

      expect(screen.queryByText('Edit Presentation')).not.toBeInTheDocument()
    })

    it('should populate form with presentation data', () => {
      render(<EditPresentationModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(
        /presentation name/i,
      ) as HTMLInputElement
      const tagsInput = screen.getByLabelText(/tags/i) as HTMLInputElement

      expect(nameInput.value).toBe('existing-presentation')
      expect(tagsInput.value).toBe('tag1, tag2')
    })

    it('should handle presentation without tags', () => {
      const presentationWithoutTags: PresentationDetail = {
        ...mockPresentation,
        tags: [],
      }

      render(
        <EditPresentationModal
          {...defaultProps}
          presentation={presentationWithoutTags}
        />,
      )

      const tagsInput = screen.getByLabelText(/tags/i) as HTMLInputElement
      expect(tagsInput.value).toBe('')
    })
  })

  describe('Form Validation', () => {
    it('should show validation error when presentation name is empty', async () => {
      const user = userEvent.setup()
      render(<EditPresentationModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/presentation name/i)
      await user.clear(nameInput)

      const submitButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/presentation name is required/i),
        ).toBeInTheDocument()
      })
    })

    it('should show validation error for invalid presentation name pattern', async () => {
      const user = userEvent.setup()
      render(<EditPresentationModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/presentation name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Invalid_Name_With_Caps')

      const submitButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/can only contain lowercase letters, numbers/i),
        ).toBeInTheDocument()
      })
    })

    it('should show validation error for more than 5 tags', async () => {
      const user = userEvent.setup()
      render(<EditPresentationModal {...defaultProps} />)

      const tagsInput = screen.getByLabelText(/tags/i)
      await user.clear(tagsInput)
      await user.type(tagsInput, 'tag1, tag2, tag3, tag4, tag5, tag6')

      // Blur to trigger validation
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/maximum 5 tags allowed/i)).toBeInTheDocument()
      })
    })

    it('should allow exactly 5 tags', async () => {
      const user = userEvent.setup()
      mockUpdatePresentation.mockResolvedValue(mockPresentationDbRow)

      render(<EditPresentationModal {...defaultProps} />)

      const tagsInput = screen.getByLabelText(/tags/i)
      await user.clear(tagsInput)
      await user.type(tagsInput, 'tag1, tag2, tag3, tag4, tag5')

      const submitButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdatePresentation).toHaveBeenCalled()
      })
    })
  })

  describe('Form Submission', () => {
    it('should call updatePresentation with correct data', async () => {
      const user = userEvent.setup()
      mockUpdatePresentation.mockResolvedValue(mockPresentationDbRow)

      render(<EditPresentationModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/presentation name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'updated-presentation')

      const tagsInput = screen.getByLabelText(/tags/i)
      await user.clear(tagsInput)
      await user.type(tagsInput, 'new-tag1, new-tag2')

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockUpdatePresentation).toHaveBeenCalledWith('presentation-123', {
          presentation_name: 'updated-presentation',
          tags: ['new-tag1', 'new-tag2'],
        })
      })
    })

    it('should handle empty tags as empty array', async () => {
      const user = userEvent.setup()
      mockUpdatePresentation.mockResolvedValue(mockPresentationDbRow)

      render(<EditPresentationModal {...defaultProps} />)

      const tagsInput = screen.getByLabelText(/tags/i)
      await user.clear(tagsInput)

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockUpdatePresentation).toHaveBeenCalledWith(
          'presentation-123',
          expect.objectContaining({
            tags: [],
          }),
        )
      })
    })

    it('should limit tags to 5 when submitting', async () => {
      const user = userEvent.setup()
      mockUpdatePresentation.mockResolvedValue(mockPresentationDbRow)

      render(<EditPresentationModal {...defaultProps} />)

      const tagsInput = screen.getByLabelText(/tags/i)
      await user.clear(tagsInput)
      // Type 6 tags but only first 5 should be saved
      await user.type(tagsInput, 'tag1, tag2, tag3, tag4, tag5')

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockUpdatePresentation).toHaveBeenCalledWith(
          'presentation-123',
          expect.objectContaining({
            tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
          }),
        )
      })
    })

    it('should redirect when name changes', async () => {
      const user = userEvent.setup()
      mockUpdatePresentation.mockResolvedValue(mockPresentationDbRow)

      render(<EditPresentationModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/presentation name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'new-name')

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith(
          '/test-org/folder1/folder2/new-name.presentation',
        )
      })

      expect(defaultProps.onNameChange).toHaveBeenCalledWith(
        'existing-presentation',
        'new-name',
      )
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should call onSuccess when name does not change', async () => {
      const user = userEvent.setup()
      mockUpdatePresentation.mockResolvedValue(mockPresentationDbRow)

      render(<EditPresentationModal {...defaultProps} />)

      // Only change tags, not name
      const tagsInput = screen.getByLabelText(/tags/i)
      await user.clear(tagsInput)
      await user.type(tagsInput, 'new-tags')

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled()
        expect(mockRouter.push).not.toHaveBeenCalled()
      })
    })

    it('should display error message on update failure', async () => {
      const user = userEvent.setup()
      mockUpdatePresentation.mockRejectedValue(
        new Error('Presentation name already exists'),
      )

      render(<EditPresentationModal {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(
          screen.getByText('Presentation name already exists'),
        ).toBeInTheDocument()
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      mockUpdatePresentation.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockPresentationDbRow), 100)),
      )

      render(<EditPresentationModal {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      expect(screen.getByText('Saving...')).toBeInTheDocument()
      const submitButton = screen.getByRole('button', { name: /saving/i })
      expect(submitButton).toBeDisabled()
    })


    it('should trim whitespace from tags', async () => {
      const user = userEvent.setup()
      mockUpdatePresentation.mockResolvedValue(mockPresentationDbRow)

      render(<EditPresentationModal {...defaultProps} />)

      const tagsInput = screen.getByLabelText(/tags/i)
      await user.clear(tagsInput)
      await user.type(tagsInput, '  tag1  ,  tag2  ,  tag3  ')

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockUpdatePresentation).toHaveBeenCalledWith(
          'presentation-123',
          expect.objectContaining({
            tags: ['tag1', 'tag2', 'tag3'],
          }),
        )
      })
    })
  })

  describe('Modal Interactions', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<EditPresentationModal {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should prevent closing during loading', async () => {
      const user = userEvent.setup()
      mockUpdatePresentation.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockPresentationDbRow), 1000)),
      )

      render(<EditPresentationModal {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).toBeDisabled()
    })

    it('should reset form and clear error when closing', async () => {
      const user = userEvent.setup()
      mockUpdatePresentation.mockRejectedValue(new Error('Test error'))

      render(<EditPresentationModal {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /cancel/i }))
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Form Updates on Presentation Change', () => {
    it('should update form when presentation prop changes', () => {
      const { rerender } = render(<EditPresentationModal {...defaultProps} />)

      const updatedPresentation: PresentationDetail = {
        ...mockPresentation,
        id: 'presentation-456',
        presentation_name: 'new-presentation',
        tags: ['new-tag'],
      }

      rerender(
        <EditPresentationModal
          {...defaultProps}
          presentation={updatedPresentation}
        />,
      )

      const nameInput = screen.getByLabelText(
        /presentation name/i,
      ) as HTMLInputElement
      const tagsInput = screen.getByLabelText(/tags/i) as HTMLInputElement

      expect(nameInput.value).toBe('new-presentation')
      expect(tagsInput.value).toBe('new-tag')
    })

    it('should update form when modal is reopened', () => {
      const { rerender } = render(
        <EditPresentationModal {...defaultProps} isOpen={false} />,
      )

      rerender(<EditPresentationModal {...defaultProps} isOpen={true} />)

      const nameInput = screen.getByLabelText(
        /presentation name/i,
      ) as HTMLInputElement
      expect(nameInput.value).toBe('existing-presentation')
    })
  })

  describe('Accessibility', () => {
    it('should have proper dialog role', () => {
      render(<EditPresentationModal {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should have accessible form labels', () => {
      render(<EditPresentationModal {...defaultProps} />)

      expect(screen.getByLabelText(/presentation name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
    })

    it('should have required field indicator', () => {
      render(<EditPresentationModal {...defaultProps} />)

      const label = screen.getByText(/presentation name/i).closest('label')
      expect(label?.textContent).toContain('*')
    })

    it('should have helper text for tags field', () => {
      render(<EditPresentationModal {...defaultProps} />)

      expect(
        screen.getByText(/separate multiple tags with commas \(maximum 5 tags\)/i),
      ).toBeInTheDocument()
    })
  })
})
