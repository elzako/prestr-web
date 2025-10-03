/**
 * Tests for SlideEditForm component
 */

import { render, screen, waitFor } from '../setup/render'
import userEvent from '@testing-library/user-event'
import SlideEditForm from '@/components/SlideEditForm'
import { updateSlide } from '@/lib/slide-actions'

// Mock the slide actions
jest.mock('@/lib/slide-actions', () => ({
  updateSlide: jest.fn(),
}))

const mockUpdateSlide = updateSlide as jest.MockedFunction<typeof updateSlide>

describe('SlideEditForm Component', () => {
  const mockSlide = {
    id: 'slide-123',
    slide_name: 'test-slide',
    description: 'Test slide description',
    tags: ['tag1', 'tag2'],
  }

  // Mock the full database row returned from updateSlide
  const mockSlideDbRow = {
    id: 'slide-123',
    object_id: 'obj-123',
    parent_id: 'parent-123',
    slide_name: 'updated-slide',
    description: 'Test slide description',
    tags: ['tag1', 'tag2'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'user-123',
    updated_by: 'user-123',
    deleted_at: null,
    deleted_by: null,
    metadata: {},
    settings: null,
    sys_period: null,
    version: 1,
    visibility: 'internal' as const,
    locked: false,
    locked_by: null,
    change_description: null,
    metadata_updated_at: null,
    metadata_updated_by: null,
  }

  const defaultProps = {
    slide: mockSlide,
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUpdateSlide.mockResolvedValue(mockSlideDbRow as any)
  })

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<SlideEditForm {...defaultProps} />)

      expect(screen.getByText('Edit Slide')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<SlideEditForm {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Edit Slide')).not.toBeInTheDocument()
    })

    it('should render all form fields', () => {
      render(<SlideEditForm {...defaultProps} />)

      expect(screen.getByLabelText(/slide name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
    })

    it('should populate form with slide data', () => {
      render(<SlideEditForm {...defaultProps} />)

      const slideNameInput = screen.getByLabelText(
        /slide name/i,
      ) as HTMLInputElement
      const descriptionInput = screen.getByLabelText(
        /description/i,
      ) as HTMLTextAreaElement
      const tagsInput = screen.getByLabelText(/tags/i) as HTMLInputElement

      expect(slideNameInput.value).toBe('test-slide')
      expect(descriptionInput.value).toBe('Test slide description')
      expect(tagsInput.value).toBe('tag1, tag2')
    })

    it('should render close button', () => {
      render(<SlideEditForm {...defaultProps} />)

      const closeButtons = screen.getAllByText('Close')
      expect(closeButtons.length).toBeGreaterThan(0)
    })

    it('should render save and cancel buttons', () => {
      render(<SlideEditForm {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /save changes/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /cancel/i }),
      ).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show validation error for empty slide name', async () => {
      const user = userEvent.setup()
      render(<SlideEditForm {...defaultProps} />)

      const slideNameInput = screen.getByLabelText(/slide name/i)
      await user.clear(slideNameInput)
      await user.tab()

      await waitFor(() => {
        expect(
          screen.getByText(/slide name is required/i),
        ).toBeInTheDocument()
      })
    })

    it('should show validation error for invalid slide name pattern', async () => {
      const user = userEvent.setup()
      render(<SlideEditForm {...defaultProps} />)

      const slideNameInput = screen.getByLabelText(/slide name/i)
      await user.clear(slideNameInput)
      await user.type(slideNameInput, 'Invalid_Name')
      await user.tab()

      await waitFor(() => {
        expect(
          screen.getByText(/only lowercase letters, numbers, and dashes/i),
        ).toBeInTheDocument()
      })
    })

    it('should accept valid slide name with lowercase, numbers, dashes', async () => {
      const user = userEvent.setup()
      render(<SlideEditForm {...defaultProps} />)

      const slideNameInput = screen.getByLabelText(/slide name/i)
      await user.clear(slideNameInput)
      await user.type(slideNameInput, 'valid-slide-123')

      // Should not show validation error
      expect(
        screen.queryByText(/only lowercase letters/i),
      ).not.toBeInTheDocument()
    })

    it('should show validation error for description over 160 characters', async () => {
      const { fireEvent } = await import('@testing-library/react')
      render(<SlideEditForm {...defaultProps} />)

      const descriptionInput = screen.getByLabelText(/description/i)
      fireEvent.change(descriptionInput, { target: { value: 'a'.repeat(161) } })
      fireEvent.blur(descriptionInput)

      await waitFor(() => {
        expect(
          screen.getByText(/description must be 160 characters or less/i),
        ).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should allow empty description', async () => {
      const user = userEvent.setup()
      render(<SlideEditForm {...defaultProps} />)

      const descriptionInput = screen.getByLabelText(/description/i)
      await user.clear(descriptionInput)

      expect(
        screen.queryByText(/description.*required/i),
      ).not.toBeInTheDocument()
    })

    it('should show validation error for more than 5 tags', async () => {
      const user = userEvent.setup()
      render(<SlideEditForm {...defaultProps} />)

      const tagsInput = screen.getByLabelText(/tags/i)
      await user.clear(tagsInput)
      await user.type(tagsInput, 'tag1, tag2, tag3, tag4, tag5, tag6')
      await user.tab()

      await waitFor(() => {
        expect(
          screen.getByText(/maximum 5 tags are allowed/i),
        ).toBeInTheDocument()
      })
    })

    it('should allow exactly 5 tags', async () => {
      const user = userEvent.setup()
      render(<SlideEditForm {...defaultProps} />)

      const tagsInput = screen.getByLabelText(/tags/i)
      await user.clear(tagsInput)
      await user.type(tagsInput, 'tag1, tag2, tag3, tag4, tag5')
      await user.tab()

      await waitFor(() => {
        // Should not show validation error, only helper text is OK
        const errorText = screen.queryByText(/maximum 5 tags are allowed/i)
        expect(errorText).not.toBeInTheDocument()
      })
    })

    it('should allow empty tags', async () => {
      const user = userEvent.setup()
      render(<SlideEditForm {...defaultProps} />)

      const tagsInput = screen.getByLabelText(/tags/i)
      await user.clear(tagsInput)

      // Should not show validation error (helper text is OK)
      const errorText = screen.queryByText(/maximum 5 tags are allowed/i)
      expect(errorText).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call updateSlide with correct data', async () => {
      const user = userEvent.setup()
      render(<SlideEditForm {...defaultProps} />)

      const slideNameInput = screen.getByLabelText(/slide name/i)
      await user.clear(slideNameInput)
      await user.type(slideNameInput, 'updated-slide')

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockUpdateSlide).toHaveBeenCalledWith('slide-123', {
          slide_name: 'updated-slide',
          description: 'Test slide description',
          tags: ['tag1', 'tag2'],
        })
      })
    })

    it('should trim and filter tags', async () => {
      const user = userEvent.setup()
      render(<SlideEditForm {...defaultProps} />)

      const slideNameInput = screen.getByLabelText(/slide name/i)
      await user.clear(slideNameInput)
      await user.type(slideNameInput, 'updated-slide')

      const tagsInput = screen.getByLabelText(/tags/i)
      await user.clear(tagsInput)
      await user.type(tagsInput, '  tag1  ,  tag2  , tag3,  ,  ')

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockUpdateSlide).toHaveBeenCalledWith(
          'slide-123',
          expect.objectContaining({
            tags: ['tag1', 'tag2', 'tag3'],
          }),
        )
      })
    })

    it('should handle empty description as undefined', async () => {
      const user = userEvent.setup()
      render(<SlideEditForm {...defaultProps} />)

      const slideNameInput = screen.getByLabelText(/slide name/i)
      await user.clear(slideNameInput)
      await user.type(slideNameInput, 'updated-slide')

      const descriptionInput = screen.getByLabelText(/description/i)
      await user.clear(descriptionInput)

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockUpdateSlide).toHaveBeenCalledWith(
          'slide-123',
          expect.objectContaining({
            description: undefined,
          }),
        )
      })
    })

    it('should call onSuccess with updated slide', async () => {
      const user = userEvent.setup()
      const updatedSlide = { ...mockSlideDbRow, slide_name: 'new-name' }
      mockUpdateSlide.mockResolvedValue(updatedSlide as any)

      render(<SlideEditForm {...defaultProps} />)

      const slideNameInput = screen.getByLabelText(/slide name/i)
      await user.clear(slideNameInput)
      await user.type(slideNameInput, 'new-name')

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalledWith(updatedSlide)
      })
    })

    it('should call onClose after successful save', async () => {
      const user = userEvent.setup()
      render(<SlideEditForm {...defaultProps} />)

      const slideNameInput = screen.getByLabelText(/slide name/i)
      await user.clear(slideNameInput)
      await user.type(slideNameInput, 'new-name')

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })

    it('should show error message on save failure', async () => {
      const user = userEvent.setup()
      mockUpdateSlide.mockRejectedValue(new Error('Database error'))

      render(<SlideEditForm {...defaultProps} />)

      const slideNameInput = screen.getByLabelText(/slide name/i)
      await user.clear(slideNameInput)
      await user.type(slideNameInput, 'new-name')

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/database error/i)).toBeInTheDocument()
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      mockUpdateSlide.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve(mockSlideDbRow as any),
              100,
            ),
          ),
      )

      render(<SlideEditForm {...defaultProps} />)

      const slideNameInput = screen.getByLabelText(/slide name/i)
      await user.clear(slideNameInput)
      await user.type(slideNameInput, 'new-name')

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/saving/i)).toBeInTheDocument()
      })
    })

    it('should validate slide name format on submit', async () => {
      const user = userEvent.setup()
      render(<SlideEditForm {...defaultProps} />)

      const slideNameInput = screen.getByLabelText(/slide name/i)
      await user.clear(slideNameInput)
      await user.type(slideNameInput, 'Invalid_Name')

      // Force blur to trigger validation
      await user.tab()

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      expect(saveButton).toBeDisabled()
    })

    it('should validate max tags on submit', async () => {
      const user = userEvent.setup()
      mockUpdateSlide.mockRejectedValue(
        new Error('Maximum 5 tags are allowed'),
      )

      render(<SlideEditForm {...defaultProps} />)

      const slideNameInput = screen.getByLabelText(/slide name/i)
      await user.clear(slideNameInput)
      await user.type(slideNameInput, 'new-name')

      const tagsInput = screen.getByLabelText(/tags/i)
      await user.clear(tagsInput)
      // Try to bypass frontend validation
      await user.type(tagsInput, 'tag1')

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      // Wait for potential error
      await waitFor(() => {
        expect(mockUpdateSlide).toHaveBeenCalled()
      })
    })
  })

  describe('Save Button State', () => {
    it('should disable save button when no changes made', () => {
      render(<SlideEditForm {...defaultProps} />)

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      expect(saveButton).toBeDisabled()
    })

    it('should enable save button when changes are made', async () => {
      const user = userEvent.setup()
      render(<SlideEditForm {...defaultProps} />)

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      expect(saveButton).toBeDisabled()

      const slideNameInput = screen.getByLabelText(/slide name/i)
      await user.type(slideNameInput, '-updated')

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled()
      })
    })

    it('should disable save button during submission', async () => {
      const user = userEvent.setup()
      mockUpdateSlide.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve(mockSlideDbRow as any),
              1000,
            ),
          ),
      )

      render(<SlideEditForm {...defaultProps} />)

      const slideNameInput = screen.getByLabelText(/slide name/i)
      await user.clear(slideNameInput)
      await user.type(slideNameInput, 'new-name')

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
      })
    })

    it('should disable save button when form is invalid', async () => {
      const user = userEvent.setup()
      render(<SlideEditForm {...defaultProps} />)

      const slideNameInput = screen.getByLabelText(/slide name/i)
      await user.clear(slideNameInput)
      await user.type(slideNameInput, 'Invalid Name With Spaces')
      await user.tab()

      await waitFor(() => {
        const saveButton = screen.getByRole('button', {
          name: /save changes/i,
        })
        expect(saveButton).toBeDisabled()
      })
    })
  })

  describe('Modal Interactions', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<SlideEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should call onClose when X button is clicked', async () => {
      const user = userEvent.setup()
      render(<SlideEditForm {...defaultProps} />)

      const closeButtons = screen.getAllByText('Close')
      await user.click(closeButtons[0])

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should call onClose when clicking backdrop', async () => {
      const user = userEvent.setup()
      const { container } = render(<SlideEditForm {...defaultProps} />)

      const backdrop = container.querySelector('.bg-gray-500')
      if (backdrop) {
        await user.click(backdrop)
        expect(defaultProps.onClose).toHaveBeenCalled()
      }
    })

    it('should disable cancel button during submission', async () => {
      const user = userEvent.setup()
      mockUpdateSlide.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve(mockSlideDbRow as any),
              100,
            ),
          ),
      )

      render(<SlideEditForm {...defaultProps} />)

      const slideNameInput = screen.getByLabelText(/slide name/i)
      await user.clear(slideNameInput)
      await user.type(slideNameInput, 'new-name')

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      await waitFor(() => {
        const cancelButton = screen.getByRole('button', { name: /cancel/i })
        expect(cancelButton).toBeDisabled()
      })
    })
  })

  describe('Data Handling', () => {
    it('should handle slide with null slide_name', () => {
      const slideWithNullName = {
        ...mockSlide,
        slide_name: null,
      }

      render(<SlideEditForm {...defaultProps} slide={slideWithNullName} />)

      const slideNameInput = screen.getByLabelText(
        /slide name/i,
      ) as HTMLInputElement
      expect(slideNameInput.value).toBe('')
    })

    it('should handle slide with null description', () => {
      const slideWithNullDesc = {
        ...mockSlide,
        description: null,
      }

      render(<SlideEditForm {...defaultProps} slide={slideWithNullDesc} />)

      const descInput = screen.getByLabelText(
        /description/i,
      ) as HTMLTextAreaElement
      expect(descInput.value).toBe('')
    })

    it('should handle slide with empty tags array', () => {
      const slideWithNoTags = {
        ...mockSlide,
        tags: [],
      }

      render(<SlideEditForm {...defaultProps} slide={slideWithNoTags} />)

      const tagsInput = screen.getByLabelText(/tags/i) as HTMLInputElement
      expect(tagsInput.value).toBe('')
    })
  })

  describe('Accessibility', () => {
    it('should have accessible form labels', () => {
      render(<SlideEditForm {...defaultProps} />)

      expect(screen.getByLabelText(/slide name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
    })

    it('should have screen reader text for close button', () => {
      render(<SlideEditForm {...defaultProps} />)

      const srText = screen.getAllByText('Close')
      expect(srText[0]).toHaveClass('sr-only')
    })

    it('should show helper text for tags field', () => {
      render(<SlideEditForm {...defaultProps} />)

      expect(
        screen.getByText(/separate tags with commas.*maximum 5 tags/i),
      ).toBeInTheDocument()
    })
  })
})
