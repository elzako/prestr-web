import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CompactOrgHeader from '@/components/CompactOrgHeader';
import type { Organization } from '@/types';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock OrganizationProfileModal
jest.mock('@/components/OrganizationProfileModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="org-profile-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}));

// Mock ActionDropdown
jest.mock('@/components/ActionDropdown', () => ({
  __esModule: true,
  default: ({ items }: any) => (
    <div data-testid="action-dropdown">
      {items.map((item: any) => (
        <button key={item.id} onClick={item.onClick}>
          {item.label}
        </button>
      ))}
    </div>
  ),
  ActionItem: {} as any,
}));

describe('CompactOrgHeader', () => {
  const mockOrganization: Organization = {
    id: '123',
    organization_name: 'test-org',
    tags: [],
    metadata: {
      name: 'Test Organization',
      profilePicture: 'https://example.com/image.jpg',
    },
  };

  it('renders organization name from metadata', () => {
    render(
      <CompactOrgHeader organization={mockOrganization} userRole="member" />
    );

    expect(screen.getByText('Test Organization')).toBeInTheDocument();
  });

  it('renders organization name fallback when metadata name is not available', () => {
    const orgWithoutMetadataName = {
      ...mockOrganization,
      metadata: undefined,
    };

    render(
      <CompactOrgHeader
        organization={orgWithoutMetadataName}
        userRole="member"
      />
    );

    expect(screen.getByText('test-org')).toBeInTheDocument();
  });

  it('renders small profile picture (8x8) when available', () => {
    render(
      <CompactOrgHeader organization={mockOrganization} userRole="member" />
    );

    const image = screen.getByAltText('Test Organization logo');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(image).toHaveAttribute('width', '32');
    expect(image).toHaveAttribute('height', '32');
  });

  it('renders default avatar with initial when no profile picture', () => {
    const orgWithoutPicture = {
      ...mockOrganization,
      metadata: {
        name: 'Test Organization',
      },
    };

    render(
      <CompactOrgHeader organization={orgWithoutPicture} userRole="member" />
    );

    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of "Test Organization"
  });

  it('shows action dropdown for owner role', () => {
    render(
      <CompactOrgHeader organization={mockOrganization} userRole="owner" />
    );

    expect(screen.getByTestId('action-dropdown')).toBeInTheDocument();
  });

  it('hides action dropdown for non-owner roles', () => {
    render(
      <CompactOrgHeader organization={mockOrganization} userRole="member" />
    );

    expect(screen.queryByTestId('action-dropdown')).not.toBeInTheDocument();
  });

  it('opens edit modal when edit profile is clicked', () => {
    render(
      <CompactOrgHeader organization={mockOrganization} userRole="owner" />
    );

    const editButton = screen.getByText('Edit profile');
    fireEvent.click(editButton);

    expect(screen.getByTestId('org-profile-modal')).toBeInTheDocument();
  });

  it('closes edit modal when close is triggered', () => {
    render(
      <CompactOrgHeader organization={mockOrganization} userRole="owner" />
    );

    // Open modal
    const editButton = screen.getByText('Edit profile');
    fireEvent.click(editButton);

    expect(screen.getByTestId('org-profile-modal')).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByText('Close Modal');
    fireEvent.click(closeButton);

    expect(screen.queryByTestId('org-profile-modal')).not.toBeInTheDocument();
  });

  it('has compact styling with border-bottom', () => {
    const { container } = render(
      <CompactOrgHeader organization={mockOrganization} userRole="member" />
    );

    const header = container.querySelector('.border-b');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('border-gray-200');
    expect(header).toHaveClass('bg-white');
  });

  it('renders action items including manage members', () => {
    render(
      <CompactOrgHeader organization={mockOrganization} userRole="owner" />
    );

    expect(screen.getByText('Edit profile')).toBeInTheDocument();
    expect(screen.getByText('Manage members')).toBeInTheDocument();
  });
});
