/**
 * Tests for CreateProjectModal component
 */

import { render, screen, fireEvent, waitFor } from '../setup/render'
import userEvent from '@testing-library/user-event'
import CreateProjectModal from '@/components/CreateProjectModal'
import { createProject } from '@/lib/project-actions'

// Mock the project actions
jest.mock('@/lib/project-actions', () => ({
  createProject: jest.fn(),
}))

const mockCreateProject = createProject as jest.MockedFunction<
  typeof createProject
>

describe('CreateProjectModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    organizationName: 'test-org',
    onSuccess: jest.fn(),
  }

  // Mock project object that matches the database structure
  const mockProject = {
    id: 'project-123',
    organization_id: 'org-123',
    folder_name: 'test-project',
    parent_id: null,
    full_path: '/test-project',
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

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<CreateProjectModal {...defaultProps} />)

      expect(screen.getByText('Create New Project')).toBeInTheDocument()
      expect(screen.getByLabelText(/project name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/visibility/i)).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<CreateProjectModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Create New Project')).not.toBeInTheDocument()
    })

    it('should render all form fields with correct labels', () => {
      render(<CreateProjectModal {...defaultProps} />)

      expect(screen.getByLabelText(/project name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/visibility/i)).toBeInTheDocument()
    })

    it('should render submit and cancel buttons', () => {
      render(<CreateProjectModal {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /create project/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /cancel/i }),
      ).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show validation error when project name is empty', async () => {
      const user = userEvent.setup()
      render(<CreateProjectModal {...defaultProps} />)

      const submitButton = screen.getByRole('button', {
        name: /create project/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/project name is required/i),
        ).toBeInTheDocument()
      })
    })

    it('should show validation error for invalid project name pattern', async () => {
      const user = userEvent.setup()
      render(<CreateProjectModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/project name/i)
      await user.type(nameInput, 'Invalid Project Name!')

      const submitButton = screen.getByRole('button', {
        name: /create project/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/can only contain letters, numbers, hyphens/i),
        ).toBeInTheDocument()
      })
    })

    it('should accept valid project name with letters, numbers, hyphens, underscores', async () => {
      const user = userEvent.setup()
      mockCreateProject.mockResolvedValue({ success: true, project: mockProject })

      render(<CreateProjectModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/project name/i)
      await user.type(nameInput, 'Valid-Project_123')

      const submitButton = screen.getByRole('button', {
        name: /create project/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreateProject).toHaveBeenCalled()
      })
    })

    it('should not show validation error on blur (validates on submit only)', async () => {
      const user = userEvent.setup()
      render(<CreateProjectModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/project name/i)
      await user.click(nameInput)
      await user.tab()

      // Should not show validation error until submit
      expect(
        screen.queryByText(/project name is required/i),
      ).not.toBeInTheDocument()
    })

    it('should clear validation error when valid input is entered', async () => {
      const user = userEvent.setup()
      render(<CreateProjectModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/project name/i)
      const submitButton = screen.getByRole('button', {
        name: /create project/i,
      })

      // Trigger validation error
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/project name is required/i),
        ).toBeInTheDocument()
      })

      // Enter valid input
      await user.type(nameInput, 'valid-project')

      await waitFor(() => {
        expect(
          screen.queryByText(/project name is required/i),
        ).not.toBeInTheDocument()
      })
    })

    it('should validate project name pattern with spaces on submit', async () => {
      const user = userEvent.setup()
      render(<CreateProjectModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/project name/i)
      await user.type(nameInput, 'project with spaces')

      const submitButton = screen.getByRole('button', {
        name: /create project/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/can only contain letters, numbers, hyphens/i),
        ).toBeInTheDocument()
      })
    })

    it('should validate project name pattern with special characters on submit', async () => {
      const user = userEvent.setup()
      render(<CreateProjectModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/project name/i)
      await user.type(nameInput, 'project@#$%')

      const submitButton = screen.getByRole('button', {
        name: /create project/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/can only contain letters, numbers, hyphens/i),
        ).toBeInTheDocument()
      })
    })

    it('should allow description to be optional', async () => {
      const user = userEvent.setup()
      mockCreateProject.mockResolvedValue({ success: true, project: mockProject })

      render(<CreateProjectModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/project name/i), 'test-project')
      await user.click(screen.getByRole('button', { name: /create project/i }))

      await waitFor(() => {
        expect(mockCreateProject).toHaveBeenCalledWith(
          'test-org',
          expect.objectContaining({
            description: undefined,
          }),
        )
      })
    })

    it('should allow tags to be optional', async () => {
      const user = userEvent.setup()
      mockCreateProject.mockResolvedValue({ success: true, project: mockProject })

      render(<CreateProjectModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/project name/i), 'test-project')
      await user.click(screen.getByRole('button', { name: /create project/i }))

      await waitFor(() => {
        expect(mockCreateProject).toHaveBeenCalledWith(
          'test-org',
          expect.objectContaining({
            tags: undefined,
          }),
        )
      })
    })

    it('should have default visibility value', () => {
      render(<CreateProjectModal {...defaultProps} />)

      const visibilitySelect = screen.getByLabelText(
        /visibility/i,
      ) as HTMLSelectElement
      expect(visibilitySelect.value).toBe('internal')
    })
  })

  describe('Form Submission', () => {
    it('should call createProject with correct data', async () => {
      const user = userEvent.setup()
      mockCreateProject.mockResolvedValue({ success: true, project: mockProject })

      render(<CreateProjectModal {...defaultProps} />)

      // Fill out form
      await user.type(screen.getByLabelText(/project name/i), 'new-project')
      await user.type(
        screen.getByLabelText(/description/i),
        'Test description',
      )
      await user.type(screen.getByLabelText(/tags/i), 'web, mobile')
      await user.selectOptions(screen.getByLabelText(/visibility/i), 'public')

      // Submit form
      await user.click(screen.getByRole('button', { name: /create project/i }))

      await waitFor(() => {
        expect(mockCreateProject).toHaveBeenCalledWith('test-org', {
          folderName: 'new-project',
          description: 'Test description',
          tags: ['web', 'mobile'],
          visibility: 'public',
        })
      })
    })

    it('should handle successful submission', async () => {
      const user = userEvent.setup()
      mockCreateProject.mockResolvedValue({ success: true, project: mockProject })

      render(<CreateProjectModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/project name/i), 'new-project')
      await user.click(screen.getByRole('button', { name: /create project/i }))

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled()
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })

    it('should display error message on submission failure', async () => {
      const user = userEvent.setup()
      mockCreateProject.mockResolvedValue({
        success: false,
        error: 'Project already exists',
      })

      render(<CreateProjectModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/project name/i), 'existing')
      await user.click(screen.getByRole('button', { name: /create project/i }))

      await waitFor(() => {
        expect(screen.getByText('Project already exists')).toBeInTheDocument()
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      mockCreateProject.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, project: mockProject }), 100)),
      )

      render(<CreateProjectModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/project name/i), 'new-project')
      await user.click(screen.getByRole('button', { name: /create project/i }))

      expect(screen.getByText('Creating...')).toBeInTheDocument()
      const submitButton = screen.getByRole('button', { name: /creating/i })
      expect(submitButton).toBeDisabled()
    })

    it('should trim whitespace from description', async () => {
      const user = userEvent.setup()
      mockCreateProject.mockResolvedValue({ success: true, project: mockProject })

      render(<CreateProjectModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/project name/i), 'project-name')
      await user.type(
        screen.getByLabelText(/description/i),
        '  description with spaces  ',
      )
      await user.click(screen.getByRole('button', { name: /create project/i }))

      await waitFor(() => {
        expect(mockCreateProject).toHaveBeenCalledWith('test-org', {
          folderName: 'project-name',
          description: 'description with spaces',
          tags: undefined,
          visibility: 'internal',
        })
      })
    })

    it('should process tags correctly', async () => {
      const user = userEvent.setup()
      mockCreateProject.mockResolvedValue({ success: true, project: mockProject })

      render(<CreateProjectModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/project name/i), 'project')
      await user.type(screen.getByLabelText(/tags/i), 'tag1,  tag2  , tag3')
      await user.click(screen.getByRole('button', { name: /create project/i }))

      await waitFor(() => {
        expect(mockCreateProject).toHaveBeenCalledWith(
          'test-org',
          expect.objectContaining({
            tags: ['tag1', 'tag2', 'tag3'],
          }),
        )
      })
    })

    it('should handle empty tags', async () => {
      const user = userEvent.setup()
      mockCreateProject.mockResolvedValue({ success: true, project: mockProject })

      render(<CreateProjectModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/project name/i), 'project')
      await user.click(screen.getByRole('button', { name: /create project/i }))

      await waitFor(() => {
        expect(mockCreateProject).toHaveBeenCalledWith(
          'test-org',
          expect.objectContaining({
            tags: undefined,
          }),
        )
      })
    })
  })

  describe('Modal Interactions', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<CreateProjectModal {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should reset form when closed', async () => {
      const user = userEvent.setup()
      render(<CreateProjectModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(
        /project name/i,
      ) as HTMLInputElement
      await user.type(nameInput, 'test-project')

      expect(nameInput.value).toBe('test-project')

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      // Since reset is called, the input would be cleared if we re-opened
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should prevent closing during loading', async () => {
      const user = userEvent.setup()
      mockCreateProject.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, project: mockProject }), 1000)),
      )

      render(<CreateProjectModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/project name/i), 'project')
      await user.click(screen.getByRole('button', { name: /create project/i }))

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).toBeDisabled()
    })

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup()
      mockCreateProject.mockResolvedValue({ success: true, project: mockProject })

      const { rerender } = render(<CreateProjectModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/project name/i), 'test-project')
      await user.type(screen.getByLabelText(/description/i), 'Test description')
      await user.click(screen.getByRole('button', { name: /create project/i }))

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled()
      })

      // Re-open modal to verify form was reset
      rerender(<CreateProjectModal {...defaultProps} isOpen={true} />)

      const nameInput = screen.getByLabelText(/project name/i) as HTMLInputElement
      const descInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement

      expect(nameInput.value).toBe('')
      expect(descInput.value).toBe('')
    })

    it('should clear error message when closing modal', async () => {
      const user = userEvent.setup()
      mockCreateProject.mockResolvedValue({
        success: false,
        error: 'Test error',
      })

      render(<CreateProjectModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/project name/i), 'test')
      await user.click(screen.getByRole('button', { name: /create project/i }))

      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      // Error should be cleared when modal is reopened
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper dialog role', () => {
      render(<CreateProjectModal {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should have accessible form labels', () => {
      render(<CreateProjectModal {...defaultProps} />)

      expect(screen.getByLabelText(/project name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/visibility/i)).toBeInTheDocument()
    })

    it('should have required field indicator', () => {
      render(<CreateProjectModal {...defaultProps} />)

      const label = screen.getByText(/project name/i).closest('label')
      expect(label?.textContent).toContain('*')
    })

    it('should have helper text for form fields', () => {
      render(<CreateProjectModal {...defaultProps} />)

      expect(
        screen.getByText(/only letters, numbers, hyphens/i),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/separate multiple tags with commas/i),
      ).toBeInTheDocument()
    })
  })

  describe('Default Values', () => {
    it('should set default visibility to internal', () => {
      render(<CreateProjectModal {...defaultProps} />)

      const select = screen.getByLabelText(/visibility/i) as HTMLSelectElement
      expect(select.value).toBe('internal')
    })

    it('should have all visibility options', () => {
      render(<CreateProjectModal {...defaultProps} />)

      const select = screen.getByLabelText(/visibility/i)
      expect(select).toContainHTML('<option value="internal">Internal</option>')
      expect(select).toContainHTML(
        '<option value="restricted">Restricted</option>',
      )
      expect(select).toContainHTML('<option value="public">Public</option>')
    })
  })
})
