/**
 * Tests for EditProjectModal component
 */

import { render, screen, waitFor } from '../setup/render'
import userEvent from '@testing-library/user-event'
import EditProjectModal from '@/components/EditProjectModal'
import { updateProject } from '@/lib/project-actions'
import type { Project } from '@/types'

// Mock the project actions
jest.mock('@/lib/project-actions', () => ({
  updateProject: jest.fn(),
}))

const mockUpdateProject = updateProject as jest.MockedFunction<
  typeof updateProject
>

describe('EditProjectModal Component', () => {
  const mockProject: Project = {
    id: 'project-123',
    organization_id: 'org-123',
    folder_name: 'existing-project',
    parent_id: null,
    full_path: 'existing-project',
    visibility: 'internal',
    tags: ['web', 'mobile'],
    metadata: {
      description: 'Existing project description',
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    deleted_at: null,
  }

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    organizationName: 'test-org',
    project: mockProject,
    onSuccess: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render when isOpen is true with project', () => {
      render(<EditProjectModal {...defaultProps} />)

      expect(screen.getByText('Edit Project')).toBeInTheDocument()
      expect(screen.getByLabelText(/project name/i)).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<EditProjectModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Edit Project')).not.toBeInTheDocument()
    })

    it('should not render when project is null', () => {
      render(<EditProjectModal {...defaultProps} project={null} />)

      expect(screen.queryByText('Edit Project')).not.toBeInTheDocument()
    })

    it('should populate form with existing project data', () => {
      render(<EditProjectModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(
        /project name/i,
      ) as HTMLInputElement
      const descInput = screen.getByLabelText(
        /description/i,
      ) as HTMLTextAreaElement
      const tagsInput = screen.getByLabelText(/tags/i) as HTMLInputElement
      const visibilitySelect = screen.getByLabelText(
        /visibility/i,
      ) as HTMLSelectElement

      expect(nameInput.value).toBe('existing-project')
      expect(descInput.value).toBe('Existing project description')
      expect(tagsInput.value).toBe('web, mobile')
      expect(visibilitySelect.value).toBe('internal')
    })

    it('should handle project without description', () => {
      const projectWithoutDesc = {
        ...mockProject,
        metadata: {},
      }

      render(
        <EditProjectModal {...defaultProps} project={projectWithoutDesc} />,
      )

      const descInput = screen.getByLabelText(
        /description/i,
      ) as HTMLTextAreaElement
      expect(descInput.value).toBe('')
    })

    it('should handle project without tags', () => {
      const projectWithoutTags: Project = {
        ...mockProject,
        tags: [],
      }

      render(
        <EditProjectModal {...defaultProps} project={projectWithoutTags} />,
      )

      const tagsInput = screen.getByLabelText(/tags/i) as HTMLInputElement
      expect(tagsInput.value).toBe('')
    })
  })

  describe('Form Validation', () => {
    it('should show validation error when project name is empty', async () => {
      const user = userEvent.setup()
      render(<EditProjectModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/project name/i)
      await user.clear(nameInput)

      const submitButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/project name is required/i),
        ).toBeInTheDocument()
      })
    })

    it('should show validation error for invalid project name pattern', async () => {
      const user = userEvent.setup()
      render(<EditProjectModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/project name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Invalid Name!')

      const submitButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/can only contain letters, numbers, hyphens/i),
        ).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should call updateProject with correct data', async () => {
      const user = userEvent.setup()
      mockUpdateProject.mockResolvedValue({ success: true, project: mockProject as any })

      render(<EditProjectModal {...defaultProps} />)

      // Modify form
      const nameInput = screen.getByLabelText(/project name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'updated-project')

      const descInput = screen.getByLabelText(/description/i)
      await user.clear(descInput)
      await user.type(descInput, 'Updated description')

      // Submit form
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockUpdateProject).toHaveBeenCalledWith(
          'test-org',
          'project-123',
          {
            folderName: 'updated-project',
            description: 'Updated description',
            tags: ['web', 'mobile'],
            visibility: 'internal',
          },
        )
      })
    })

    it('should handle successful update', async () => {
      const user = userEvent.setup()
      mockUpdateProject.mockResolvedValue({ success: true, project: mockProject as any })

      render(<EditProjectModal {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled()
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })

    it('should display error message on update failure', async () => {
      const user = userEvent.setup()
      mockUpdateProject.mockResolvedValue({
        success: false,
        error: 'Project name already exists',
      })

      render(<EditProjectModal {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(
          screen.getByText('Project name already exists'),
        ).toBeInTheDocument()
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      mockUpdateProject.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true, project: mockProject as any }), 100),
          ),
      )

      render(<EditProjectModal {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      expect(screen.getByText('Saving...')).toBeInTheDocument()
      const submitButton = screen.getByRole('button', { name: /saving/i })
      expect(submitButton).toBeDisabled()
    })

    it('should update tags correctly', async () => {
      const user = userEvent.setup()
      mockUpdateProject.mockResolvedValue({ success: true, project: mockProject as any })

      render(<EditProjectModal {...defaultProps} />)

      const tagsInput = screen.getByLabelText(/tags/i)
      await user.clear(tagsInput)
      await user.type(tagsInput, 'api, backend, frontend')

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockUpdateProject).toHaveBeenCalledWith(
          'test-org',
          'project-123',
          expect.objectContaining({
            tags: ['api', 'backend', 'frontend'],
          }),
        )
      })
    })

    it('should handle empty tags as empty array', async () => {
      const user = userEvent.setup()
      mockUpdateProject.mockResolvedValue({ success: true, project: mockProject as any })

      render(<EditProjectModal {...defaultProps} />)

      const tagsInput = screen.getByLabelText(/tags/i)
      await user.clear(tagsInput)

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockUpdateProject).toHaveBeenCalledWith(
          'test-org',
          'project-123',
          expect.objectContaining({
            tags: [],
          }),
        )
      })
    })

    it('should update visibility', async () => {
      const user = userEvent.setup()
      mockUpdateProject.mockResolvedValue({ success: true, project: mockProject as any })

      render(<EditProjectModal {...defaultProps} />)

      const visibilitySelect = screen.getByLabelText(/visibility/i)
      await user.selectOptions(visibilitySelect, 'public')

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockUpdateProject).toHaveBeenCalledWith(
          'test-org',
          'project-123',
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
      render(<EditProjectModal {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should prevent closing during loading', async () => {
      const user = userEvent.setup()
      mockUpdateProject.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true, project: mockProject as any }), 1000),
          ),
      )

      render(<EditProjectModal {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).toBeDisabled()
    })

    it('should clear error when closing modal', async () => {
      const user = userEvent.setup()
      mockUpdateProject.mockResolvedValue({
        success: false,
        error: 'Test error',
      })

      render(<EditProjectModal {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /cancel/i }))
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Form Updates on Project Change', () => {
    it('should update form when project prop changes', () => {
      const { rerender } = render(<EditProjectModal {...defaultProps} />)

      const updatedProject: Project = {
        ...mockProject,
        id: 'project-456',
        folder_name: 'new-project',
        metadata: { description: 'New description' },
        tags: ['new-tag'],
      }

      rerender(<EditProjectModal {...defaultProps} project={updatedProject} />)

      const nameInput = screen.getByLabelText(
        /project name/i,
      ) as HTMLInputElement
      const descInput = screen.getByLabelText(
        /description/i,
      ) as HTMLTextAreaElement
      const tagsInput = screen.getByLabelText(/tags/i) as HTMLInputElement

      expect(nameInput.value).toBe('new-project')
      expect(descInput.value).toBe('New description')
      expect(tagsInput.value).toBe('new-tag')
    })

    it('should update form when modal is reopened', () => {
      const { rerender } = render(
        <EditProjectModal {...defaultProps} isOpen={false} />,
      )

      rerender(<EditProjectModal {...defaultProps} isOpen={true} />)

      const nameInput = screen.getByLabelText(
        /project name/i,
      ) as HTMLInputElement
      expect(nameInput.value).toBe('existing-project')
    })
  })

  describe('Accessibility', () => {
    it('should have proper dialog role', () => {
      render(<EditProjectModal {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should have accessible form labels', () => {
      render(<EditProjectModal {...defaultProps} />)

      expect(screen.getByLabelText(/project name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/visibility/i)).toBeInTheDocument()
    })

    it('should have required field indicator', () => {
      render(<EditProjectModal {...defaultProps} />)

      const label = screen.getByText(/project name/i).closest('label')
      expect(label?.textContent).toContain('*')
    })
  })
})
