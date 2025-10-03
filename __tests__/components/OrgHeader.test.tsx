import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OrgHeader from '@/components/OrgHeader';
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

describe('OrgHeader', () => {
  const mockOrganization: Organization = {
    id: '123',
    organization_name: 'test-org',
    tags: ['tech', 'startup'],
    metadata: {
      name: 'Test Organization',
      about: 'This is a test organization',
      website: 'https://test.com',
      location: 'San Francisco, CA',
      profilePicture: 'https://example.com/image.jpg',
    },
  };

  it('renders organization name from metadata', () => {
    render(<OrgHeader organization={mockOrganization} userRole="member" />);

    expect(screen.getByText('Test Organization')).toBeInTheDocument();
  });

  it('renders organization name fallback when metadata name is not available', () => {
    const orgWithoutMetadataName = {
      ...mockOrganization,
      metadata: undefined,
    };

    render(
      <OrgHeader organization={orgWithoutMetadataName} userRole="member" />
    );

    expect(screen.getByText('test-org')).toBeInTheDocument();
  });

  it('renders profile picture when available', () => {
    render(<OrgHeader organization={mockOrganization} userRole="member" />);

    const image = screen.getByAltText('Test Organization logo');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('renders default avatar with initial when no profile picture', () => {
    const orgWithoutPicture = {
      ...mockOrganization,
      metadata: {
        ...mockOrganization.metadata,
        profilePicture: undefined,
      },
    };

    render(<OrgHeader organization={orgWithoutPicture} userRole="member" />);

    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of "Test Organization"
  });

  it('renders about section when available', () => {
    render(<OrgHeader organization={mockOrganization} userRole="member" />);

    expect(
      screen.getByText('This is a test organization')
    ).toBeInTheDocument();
  });

  it('renders location when available', () => {
    render(<OrgHeader organization={mockOrganization} userRole="member" />);

    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
  });

  it('renders website link when available', () => {
    render(<OrgHeader organization={mockOrganization} userRole="member" />);

    const websiteLink = screen.getByText('https://test.com');
    expect(websiteLink).toBeInTheDocument();
    expect(websiteLink).toHaveAttribute('href', 'https://test.com');
    expect(websiteLink).toHaveAttribute('target', '_blank');
    expect(websiteLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('prepends https:// to website link if not present', () => {
    const orgWithSimpleWebsite = {
      ...mockOrganization,
      metadata: {
        ...mockOrganization.metadata,
        website: 'test.com',
      },
    };

    render(<OrgHeader organization={orgWithSimpleWebsite} userRole="member" />);

    const websiteLink = screen.getByText('test.com');
    expect(websiteLink).toHaveAttribute('href', 'https://test.com');
  });

  it('renders tags when available', () => {
    render(<OrgHeader organization={mockOrganization} userRole="member" />);

    expect(screen.getByText('tech')).toBeInTheDocument();
    expect(screen.getByText('startup')).toBeInTheDocument();
  });

  it('shows action dropdown for owner role', () => {
    render(<OrgHeader organization={mockOrganization} userRole="owner" />);

    expect(screen.getByTestId('action-dropdown')).toBeInTheDocument();
  });

  it('hides action dropdown for non-owner roles', () => {
    render(<OrgHeader organization={mockOrganization} userRole="member" />);

    expect(screen.queryByTestId('action-dropdown')).not.toBeInTheDocument();
  });

  it('opens edit modal when edit profile is clicked', () => {
    render(<OrgHeader organization={mockOrganization} userRole="owner" />);

    const editButton = screen.getByText('Edit profile');
    fireEvent.click(editButton);

    expect(screen.getByTestId('org-profile-modal')).toBeInTheDocument();
  });

  it('closes edit modal when close is triggered', () => {
    render(<OrgHeader organization={mockOrganization} userRole="owner" />);

    // Open modal
    const editButton = screen.getByText('Edit profile');
    fireEvent.click(editButton);

    expect(screen.getByTestId('org-profile-modal')).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByText('Close Modal');
    fireEvent.click(closeButton);

    expect(screen.queryByTestId('org-profile-modal')).not.toBeInTheDocument();
  });

  it('does not render optional fields when not available', () => {
    const minimalOrg: Organization = {
      id: '123',
      organization_name: 'minimal-org',
      tags: [],
      metadata: {
        name: 'Minimal Org',
      },
    };

    render(<OrgHeader organization={minimalOrg} userRole="member" />);

    expect(screen.getByText('Minimal Org')).toBeInTheDocument();
    expect(screen.queryByText('San Francisco, CA')).not.toBeInTheDocument();
    expect(screen.queryByText('https://test.com')).not.toBeInTheDocument();
  });
});
