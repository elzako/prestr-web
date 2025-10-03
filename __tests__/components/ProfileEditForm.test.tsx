/**
 * Tests for ProfileEditForm component
 */

import { render, screen, waitFor, act } from '../setup/render'
import userEvent from '@testing-library/user-event'
import { ProfileEditForm } from '@/components/ProfileEditForm'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

// Mock Supabase client
const mockUpdate = jest.fn()
const mockSelect = jest.fn()
const mockSingle = jest.fn()
const mockEq = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      update: mockUpdate,
    })),
  })),
}))

describe('ProfileEditForm Component', () => {
  let consoleErrorSpy: jest.SpyInstance
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
  }

  const mockUserProfile: UserProfile = {
    id: 'user-123',
    metadata: {
      firstName: 'John',
      lastName: 'Doe',
      position: 'Software Engineer',
    },
    deleted_at: null,
    deleted_by: null,
  }

  const mockOnProfileUpdate = jest.fn()

  const defaultProps = {
    userProfile: mockUserProfile,
    userId: 'user-123',
    user: mockUser,
    onProfileUpdate: mockOnProfileUpdate,
  }

  const advanceTimers = (ms: number = 0) => {
    act(() => {
      jest.advanceTimersByTime(ms)
    })
  }

  const createUser = () =>
    userEvent.setup({
      delay: null,
      advanceTimers,
    })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    // Setup mock chain
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockSingle.mockResolvedValue({
      data: mockUserProfile,
      error: null,
    })
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    consoleErrorSpy.mockRestore()
    jest.useRealTimers()
  })

  describe('View Mode Rendering', () => {
    it('should render in view mode by default', () => {
      render(<ProfileEditForm {...defaultProps} />)

      expect(screen.getByText('Profile Information')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /edit profile/i }),
      ).toBeInTheDocument()
    })

    it('should display user profile data', () => {
      render(<ProfileEditForm {...defaultProps} />)

      expect(screen.getByText('John')).toBeInTheDocument()
      expect(screen.getByText('Doe')).toBeInTheDocument()
      expect(screen.getByText('Software Engineer')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    it('should display user ID', () => {
      render(<ProfileEditForm {...defaultProps} />)

      expect(screen.getByText('user-123')).toBeInTheDocument()
    })

    it('should display account creation date', () => {
      render(<ProfileEditForm {...defaultProps} />)

      expect(screen.getByText(/1\/1\/2024/)).toBeInTheDocument()
    })

    it('should show "Not provided" for empty fields', () => {
      const emptyProfile = {
        ...mockUserProfile,
        metadata: {},
      }

      render(<ProfileEditForm {...defaultProps} userProfile={emptyProfile} />)

      const notProvidedElements = screen.getAllByText('Not provided')
      expect(notProvidedElements.length).toBeGreaterThan(0)
    })

    it('should handle null userProfile', () => {
      render(<ProfileEditForm {...defaultProps} userProfile={null} />)

      expect(
        screen.getByRole('button', { name: /edit profile/i }),
      ).toBeInTheDocument()
    })
  })

  describe('Edit Mode', () => {
    it('should switch to edit mode when clicking edit button', async () => {
      const user = createUser()
      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/position/i)).toBeInTheDocument()
    })

    it('should populate form fields with existing data', async () => {
      const user = createUser()
      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const firstNameInput = screen.getByLabelText(
        /first name/i,
      ) as HTMLInputElement
      const lastNameInput = screen.getByLabelText(
        /last name/i,
      ) as HTMLInputElement
      const positionInput = screen.getByLabelText(
        /position/i,
      ) as HTMLInputElement

      expect(firstNameInput.value).toBe('John')
      expect(lastNameInput.value).toBe('Doe')
      expect(positionInput.value).toBe('Software Engineer')
    })

    it('should show disabled email field', async () => {
      const user = createUser()
      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
      expect(emailInput).toBeDisabled()
      expect(emailInput.value).toBe('test@example.com')
    })

    it('should show disabled user ID field', async () => {
      const user = createUser()
      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const userIdInput = screen.getByLabelText(/user id/i) as HTMLInputElement
      expect(userIdInput).toBeDisabled()
      expect(userIdInput.value).toBe('user-123')
    })

    it('should show cancel and save buttons', async () => {
      const user = createUser()
      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      expect(
        screen.getByRole('button', { name: /cancel/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /save changes/i }),
      ).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show validation error for empty first name', async () => {
      const user = createUser()
      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const firstNameInput = screen.getByLabelText(/first name/i)
      await user.clear(firstNameInput)
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(
          screen.getByText(/first name is required/i),
        ).toBeInTheDocument()
      })
    })

    it('should show validation error for short first name', async () => {
      const user = createUser()
      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const firstNameInput = screen.getByLabelText(/first name/i)
      await user.clear(firstNameInput)
      await user.type(firstNameInput, 'J')
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(
          screen.getByText(/first name must be at least 2 characters/i),
        ).toBeInTheDocument()
      })
    })

    it('should show validation error for long first name', async () => {
      const user = createUser()
      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const firstNameInput = screen.getByLabelText(/first name/i)
      await user.clear(firstNameInput)
      await user.type(firstNameInput, 'a'.repeat(51))
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(
          screen.getByText(/first name must be less than 50 characters/i),
        ).toBeInTheDocument()
      })
    })

    it('should show validation error for empty last name', async () => {
      const user = createUser()
      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const lastNameInput = screen.getByLabelText(/last name/i)
      await user.clear(lastNameInput)
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(
          screen.getByText(/last name is required/i),
        ).toBeInTheDocument()
      })
    })

    it('should show validation error for long position', async () => {
      const user = createUser()
      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const positionInput = screen.getByLabelText(/position/i)
      await user.clear(positionInput)
      await user.type(positionInput, 'a'.repeat(101))
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(
          screen.getByText(/position must be less than 100 characters/i),
        ).toBeInTheDocument()
      })
    })

    it('should allow empty position field', async () => {
      const user = createUser()
      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const positionInput = screen.getByLabelText(/position/i)
      await user.clear(positionInput)

      // Should not show validation error for empty position
      expect(
        screen.queryByText(/position.*required/i),
      ).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call Supabase update with correct data', async () => {
      const user = createUser()
      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const firstNameInput = screen.getByLabelText(/first name/i)
      await user.clear(firstNameInput)
      await user.type(firstNameInput, 'Jane')

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith({
          metadata: expect.objectContaining({
            firstName: 'Jane',
            lastName: 'Doe',
            position: 'Software Engineer',
          }),
        })
      })
    })

    it('should call onProfileUpdate with updated profile', async () => {
      const user = createUser()
      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const firstNameInput = screen.getByLabelText(/first name/i)
      await user.clear(firstNameInput)
      await user.type(firstNameInput, 'Jane')

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockOnProfileUpdate).toHaveBeenCalledWith(mockUserProfile)
      })
    })

    it('should show success message after update', async () => {
      const user = createUser()
      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const firstNameInput = screen.getByLabelText(/first name/i)
      await user.clear(firstNameInput)
      await user.type(firstNameInput, 'Jane')

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(
          screen.getByText(/profile updated successfully/i),
        ).toBeInTheDocument()
      })
    })

    it('should return to view mode after successful update', async () => {
      const user = createUser()
      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const firstNameInput = screen.getByLabelText(/first name/i)
      await user.clear(firstNameInput)
      await user.type(firstNameInput, 'Jane')

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /edit profile/i }),
        ).toBeInTheDocument()
      })
    })

    it('should display error message on update failure', async () => {
      const user = createUser()
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const firstNameInput = screen.getByLabelText(/first name/i)
      await user.clear(firstNameInput)
      await user.type(firstNameInput, 'Jane')

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(screen.getByText(/database error/i)).toBeInTheDocument()
      })
    })

    it('should show loading state during submission', async () => {
      const user = createUser()
      mockSingle.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ data: mockUserProfile, error: null }),
              100,
            ),
          ),
      )

      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const firstNameInput = screen.getByLabelText(/first name/i)
      await user.clear(firstNameInput)
      await user.type(firstNameInput, 'Jane')

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(screen.getByText(/saving/i)).toBeInTheDocument()
      })
    })

    it('should disable save button when no changes made', async () => {
      const user = createUser()
      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      expect(saveButton).toBeDisabled()
    })

    it('should enable save button when changes are made', async () => {
      const user = createUser()
      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      expect(saveButton).toBeDisabled()

      const firstNameInput = screen.getByLabelText(/first name/i)
      await user.type(firstNameInput, ' Updated')

      expect(saveButton).not.toBeDisabled()
    })
  })

  describe('Cancel Functionality', () => {
    it('should return to view mode when cancel is clicked', async () => {
      const user = createUser()
      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))
      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(
        screen.getByRole('button', { name: /edit profile/i }),
      ).toBeInTheDocument()
    })

    it('should reset form data when cancel is clicked', async () => {
      const user = createUser()
      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const firstNameInput = screen.getByLabelText(/first name/i)
      await user.clear(firstNameInput)
      await user.type(firstNameInput, 'Modified')

      await user.click(screen.getByRole('button', { name: /cancel/i }))
      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const resetInput = screen.getByLabelText(
        /first name/i,
      ) as HTMLInputElement
      expect(resetInput.value).toBe('John')
    })

    it('should clear error messages when cancel is clicked', async () => {
      const user = createUser()
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Test error' },
      })

      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const firstNameInput = screen.getByLabelText(/first name/i)
      await user.clear(firstNameInput)
      await user.type(firstNameInput, 'Jane')
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(screen.getByText(/test error/i)).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(screen.queryByText(/test error/i)).not.toBeInTheDocument()
    })
  })

  describe('Success Message', () => {
    it('should auto-clear success message after 3 seconds', async () => {
      const user = createUser()
      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const firstNameInput = screen.getByLabelText(/first name/i)
      await user.clear(firstNameInput)
      await user.type(firstNameInput, 'Jane')

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(
          screen.getByText(/profile updated successfully/i),
        ).toBeInTheDocument()
      })

      act(() => {
        jest.advanceTimersByTime(3000)
      })

      await waitFor(() => {
        expect(
          screen.queryByText(/profile updated successfully/i),
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have accessible form labels', async () => {
      const user = createUser()
      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/position/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    it('should disable buttons during loading', async () => {
      const user = createUser()
      mockSingle.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ data: mockUserProfile, error: null }),
              100,
            ),
          ),
      )

      render(<ProfileEditForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /edit profile/i }))

      const firstNameInput = screen.getByLabelText(/first name/i)
      await user.clear(firstNameInput)
      await user.type(firstNameInput, 'Jane')

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
        expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
      })
    })
  })
})






