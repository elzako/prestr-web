import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrganizationProfileModal from '@/components/OrganizationProfileModal';
import type { Organization } from '@/types';
import {
  updateOrganizationProfile,
  checkOrganizationNameAvailability,
} from '@/lib/organization-actions';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock organization actions
jest.mock('@/lib/organization-actions', () => ({
  updateOrganizationProfile: jest.fn(),
  checkOrganizationNameAvailability: jest.fn(),
}));

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

// Mock Headless UI components
jest.mock('@headlessui/react', () => {
  const React = require('react');
  return {
    Dialog: Object.assign(
      ({ children, onClose }: any) => (
        <div
          data-testid="dialog"
          onClick={(event: React.MouseEvent<HTMLDivElement>) => {
            if (event.target === event.currentTarget) {
              onClose?.()
            }
          }}
        >
          {children}
        </div>
      ),
      {
        Panel: ({ children }: any) => <div>{children}</div>,
        Title: ({ children }: any) => <h2>{children}</h2>,
      }
    ),
    Transition: Object.assign(
      ({ children, show }: any) => (show ? <div>{children}</div> : null),
      {
        Root: ({ children, show }: any) => (show ? <div>{children}</div> : null),
        Child: ({ children }: any) => <div>{children}</div>,
      }
    ),
  };
});

describe('OrganizationProfileModal', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  };

  const mockOrganization: Organization = {
    id: 'org-123',
    organization_name: 'test-org',
    tags: [],
    metadata: {
      name: 'Test Organization',
      about: 'A test organization',
      website: 'https://example.com',
      location: 'New York, NY',
    },
  };

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    organization: mockOrganization,
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (checkOrganizationNameAvailability as jest.Mock).mockResolvedValue({
      success: true,
      available: true,
    });
    (updateOrganizationProfile as jest.Mock).mockResolvedValue({
      success: true,
      data: mockOrganization,
    });
  });

  describe('Rendering', () => {
    it('does not render when isOpen is false', () => {
      render(<OrganizationProfileModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Edit Organization Profile')).not.toBeInTheDocument();
    });

    it('renders modal when isOpen is true', () => {
      render(<OrganizationProfileModal {...defaultProps} />);

      expect(screen.getByText('Edit Organization Profile')).toBeInTheDocument();
    });

    it('renders all form fields', () => {
      render(<OrganizationProfileModal {...defaultProps} />);

      expect(screen.getByLabelText('Organization URL')).toBeInTheDocument();
      expect(screen.getByLabelText('Organization Name')).toBeInTheDocument();
      expect(screen.getByLabelText('About')).toBeInTheDocument();
      expect(screen.getByLabelText('Website')).toBeInTheDocument();
      expect(screen.getByLabelText('Location')).toBeInTheDocument();
    });

    it('pre-fills form with organization data', () => {
      render(<OrganizationProfileModal {...defaultProps} />);

      expect(screen.getByDisplayValue('test-org')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Organization')).toBeInTheDocument();
      expect(screen.getByDisplayValue('A test organization')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('New York, NY')).toBeInTheDocument();
    });

    it('renders close button', () => {
      render(<OrganizationProfileModal {...defaultProps} />);

      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('renders save and cancel buttons', () => {
      render(<OrganizationProfileModal {...defaultProps} />);

      expect(screen.getByText('Save Changes')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates required organization name', async () => {
      render(<OrganizationProfileModal {...defaultProps} />);

      const nameInput = screen.getByLabelText('Organization Name');
      fireEvent.change(nameInput, { target: { value: '' } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText('Organization name is required')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('validates organization URL format', async () => {
      const user = userEvent.setup();
      render(<OrganizationProfileModal {...defaultProps} />);

      const urlInput = screen.getByLabelText('Organization URL');
      await user.clear(urlInput);
      await user.type(urlInput, 'Invalid Name!');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText('Only lowercase letters, numbers, and hyphens are allowed')
        ).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('validates minimum length for organization URL', async () => {
      render(<OrganizationProfileModal {...defaultProps} />);

      const urlInput = screen.getByLabelText('Organization URL');
      fireEvent.change(urlInput, { target: { value: 'ab' } });
      fireEvent.blur(urlInput);

      await waitFor(() => {
        expect(
          screen.getByText('Organization name must be at least 3 characters')
        ).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('validates maximum length for organization name', async () => {
      const { fireEvent } = await import('@testing-library/react');
      render(<OrganizationProfileModal {...defaultProps} />);

      const nameInput = screen.getByLabelText('Organization Name');
      fireEvent.change(nameInput, { target: { value: 'a'.repeat(101) } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(
          screen.getByText('Organization name must be less than 100 characters')
        ).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('validates website URL format', async () => {
      const { fireEvent } = await import('@testing-library/react');
      render(<OrganizationProfileModal {...defaultProps} />);

      const websiteInput = screen.getByLabelText('Website');
      fireEvent.change(websiteInput, { target: { value: 'not-a-url' } });
      fireEvent.blur(websiteInput);

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid URL starting with http:// or https://')
        ).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('validates maximum length for about field', async () => {
      const { fireEvent } = await import('@testing-library/react');
      render(<OrganizationProfileModal {...defaultProps} />);

      const aboutInput = screen.getByLabelText('About');
      fireEvent.change(aboutInput, { target: { value: 'a'.repeat(501) } });
      fireEvent.blur(aboutInput);

      await waitFor(() => {
        expect(
          screen.getByText('About must be less than 500 characters')
        ).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Form Submission', () => {
    it('submits form with updated data', async () => {
      const user = userEvent.setup({ delay: null });
      render(<OrganizationProfileModal {...defaultProps} />);

      const nameInput = screen.getByLabelText('Organization Name');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');

      // Wait for form to be dirty
      await waitFor(() => {
        const saveButton = screen.getByText('Save Changes');
        expect(saveButton).not.toBeDisabled();
      });

      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      await waitFor(() => {
        expect(updateOrganizationProfile).toHaveBeenCalledWith(
          'org-123',
          expect.objectContaining({
            metadata: expect.objectContaining({
              name: 'Updated Name',
            }),
          })
        );
      }, { timeout: 3000 });
    });

    it('calls onSuccess after successful update', async () => {
      render(<OrganizationProfileModal {...defaultProps} />);

      const nameInput = screen.getByLabelText('Organization Name');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalledWith(mockOrganization);
      });
    });

    it('calls onClose after successful update', async () => {
      render(<OrganizationProfileModal {...defaultProps} />);

      const nameInput = screen.getByLabelText('Organization Name');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });

    it('disables submit button while loading', async () => {
      (updateOrganizationProfile as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<OrganizationProfileModal {...defaultProps} />);

      const nameInput = screen.getByLabelText('Organization Name');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
        expect(saveButton).toBeDisabled();
      });
    });

    it('disables submit button when form is not dirty', () => {
      render(<OrganizationProfileModal {...defaultProps} />);

      const saveButton = screen.getByText('Save Changes');
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Organization Name Change', () => {
    it('checks name availability when organization URL changes', async () => {
      const user = userEvent.setup({ delay: null });
      render(<OrganizationProfileModal {...defaultProps} />);

      const urlInput = screen.getByLabelText('Organization URL');
      await user.clear(urlInput);
      await user.type(urlInput, 'new-org-name');

      // Wait for nameChanged state to update and button to be enabled
      await waitFor(() => {
        const saveButton = screen.getByText('Save Changes');
        expect(saveButton).not.toBeDisabled();
      });

      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      await waitFor(() => {
        expect(checkOrganizationNameAvailability).toHaveBeenCalledWith(
          'new-org-name',
          'org-123'
        );
      }, { timeout: 3000 });
    });

    it('shows error when name is not available', async () => {
      (checkOrganizationNameAvailability as jest.Mock).mockResolvedValue({
        success: true,
        available: false,
      });

      const user = userEvent.setup();
      render(<OrganizationProfileModal {...defaultProps} />);

      const urlInput = screen.getByLabelText('Organization URL');
      await user.clear(urlInput);
      await user.type(urlInput, 'taken-name');

      // Wait for nameChanged state to update
      await waitFor(() => {
        const saveButton = screen.getByText('Save Changes');
        expect(saveButton).not.toBeDisabled();
      });

      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText('This organization name is already taken')
        ).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('redirects to new URL after organization name change', async () => {
      const updatedOrg = {
        ...mockOrganization,
        organization_name: 'new-org-name',
      };

      (updateOrganizationProfile as jest.Mock).mockResolvedValue({
        success: true,
        data: updatedOrg,
      });

      const user = userEvent.setup();
      render(<OrganizationProfileModal {...defaultProps} />);

      const urlInput = screen.getByLabelText('Organization URL');
      await user.clear(urlInput);
      await user.type(urlInput, 'new-org-name');

      // Wait for nameChanged state to update
      await waitFor(() => {
        const saveButton = screen.getByText('Save Changes');
        expect(saveButton).not.toBeDisabled();
      });

      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/new-org-name');
      }, { timeout: 3000 });
    });

    it('does not check availability when name has not changed', async () => {
      const user = userEvent.setup();
      render(<OrganizationProfileModal {...defaultProps} />);

      const nameInput = screen.getByLabelText('Organization Name');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Display Name');

      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      await waitFor(() => {
        expect(updateOrganizationProfile).toHaveBeenCalled();
      }, { timeout: 3000 });

      expect(checkOrganizationNameAvailability).not.toHaveBeenCalled();
    });
  });

  describe('Modal Controls', () => {
    it('closes modal when close button is clicked', () => {
      render(<OrganizationProfileModal {...defaultProps} />);

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('closes modal when cancel button is clicked', () => {
      render(<OrganizationProfileModal {...defaultProps} />);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('resets form when modal is closed', () => {
      const { rerender } = render(<OrganizationProfileModal {...defaultProps} />);

      const nameInput = screen.getByLabelText('Organization Name');
      fireEvent.change(nameInput, { target: { value: 'Changed Name' } });

      rerender(<OrganizationProfileModal {...defaultProps} isOpen={false} />);
      rerender(<OrganizationProfileModal {...defaultProps} isOpen={true} />);

      expect(screen.getByDisplayValue('Test Organization')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when update fails', async () => {
      (updateOrganizationProfile as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Update failed',
      });

      render(<OrganizationProfileModal {...defaultProps} />);

      const nameInput = screen.getByLabelText('Organization Name');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      });
    });

    it('displays error message when exception occurs', async () => {
      (updateOrganizationProfile as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<OrganizationProfileModal {...defaultProps} />);

      const nameInput = screen.getByLabelText('Organization Name');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('displays error when name availability check fails', async () => {
      (checkOrganizationNameAvailability as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Check failed',
      });

      const user = userEvent.setup();
      render(<OrganizationProfileModal {...defaultProps} />);

      const urlInput = screen.getByLabelText('Organization URL');
      await user.clear(urlInput);
      await user.type(urlInput, 'new-name');

      // Wait for nameChanged state to update
      await waitFor(() => {
        const saveButton = screen.getByText('Save Changes');
        expect(saveButton).not.toBeDisabled();
      });

      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Check failed')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Edge Cases', () => {
    it('handles organization without metadata', () => {
      const orgWithoutMetadata = {
        ...mockOrganization,
        metadata: undefined,
      };

      render(
        <OrganizationProfileModal
          {...defaultProps}
          organization={orgWithoutMetadata}
        />
      );

      expect(screen.getByLabelText('Organization Name')).toHaveValue('');
      expect(screen.getByLabelText('About')).toHaveValue('');
    });

    it('handles partial metadata', () => {
      const orgWithPartialMetadata = {
        ...mockOrganization,
        metadata: {
          name: 'Test Org',
        },
      };

      render(
        <OrganizationProfileModal
          {...defaultProps}
          organization={orgWithPartialMetadata}
        />
      );

      expect(screen.getByLabelText('Organization Name')).toHaveValue('Test Org');
      expect(screen.getByLabelText('About')).toHaveValue('');
      expect(screen.getByLabelText('Website')).toHaveValue('');
    });

    it('clears error when form is changed after error', async () => {
      (updateOrganizationProfile as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Update failed',
      });

      const user = userEvent.setup();
      render(<OrganizationProfileModal {...defaultProps} />);

      const nameInput = screen.getByLabelText('Organization Name');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');

      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Change form again
      (updateOrganizationProfile as jest.Mock).mockResolvedValue({
        success: true,
        data: mockOrganization,
      });

      await user.clear(nameInput);
      await user.type(nameInput, 'Another Update');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByText('Update failed')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});



