import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthHeader } from '@/components/AuthHeader';
import type { User } from '@supabase/supabase-js';

// Mock next/link - preserve all props including aria-label
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

// Mock auth actions
const mockLogout = jest.fn();
jest.mock('@/lib/auth-actions', () => ({
  logout: () => mockLogout(),
}));

// Mock components
jest.mock('@/components/Button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('@/components/Container', () => ({
  Container: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/Logo', () => ({
  Logo: (props: any) => <div data-testid="logo" {...props}>Logo</div>,
}));

jest.mock('@/components/NavLink', () => ({
  NavLink: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

describe('AuthHeader', () => {
  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: { full_name: 'John Doe' },
    aud: 'authenticated',
    created_at: '2024-01-01',
  };

  const mockUserProfile = {
    id: '123',
    full_name: 'John Doe',
    avatar_url: undefined,
    metadata: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
    },
  };

  const mockOrganization = {
    id: 'org-123',
    organization_name: 'test-org',
    user_role: 'admin' as const,
  };

  beforeEach(() => {
    mockLogout.mockClear();
  });

  it('renders logo with link to home', () => {
    render(
      <AuthHeader
        user={mockUser}
        userProfile={mockUserProfile}
        userOrganization={mockOrganization}
      />
    );

    const logoLink = screen.getByLabelText('Home');
    expect(logoLink).toHaveAttribute('href', '/');
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('renders navigation links on desktop', () => {
    render(
      <AuthHeader
        user={mockUser}
        userProfile={mockUserProfile}
        userOrganization={mockOrganization}
      />
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Presentations')).toBeInTheDocument();
    expect(screen.getByText('Organizations')).toBeInTheDocument();
  });

  it('displays user name from profile metadata', () => {
    render(
      <AuthHeader
        user={mockUser}
        userProfile={mockUserProfile}
        userOrganization={mockOrganization}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays user name fallback from user metadata when profile not available', () => {
    render(
      <AuthHeader
        user={mockUser}
        userProfile={undefined}
        userOrganization={mockOrganization}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays email username when no name is available', () => {
    const userWithoutName = {
      ...mockUser,
      user_metadata: {},
    };

    render(
      <AuthHeader
        user={userWithoutName}
        userProfile={undefined}
        userOrganization={mockOrganization}
      />
    );

    expect(screen.getByText('test')).toBeInTheDocument(); // email prefix
  });

  it('displays user initial in avatar', () => {
    render(
      <AuthHeader
        user={mockUser}
        userProfile={mockUserProfile}
        userOrganization={mockOrganization}
      />
    );

    expect(screen.getByText('J')).toBeInTheDocument(); // First letter of "John"
  });

  it('shows organization link when organization is provided', async () => {
    render(
      <AuthHeader
        user={mockUser}
        userProfile={mockUserProfile}
        userOrganization={mockOrganization}
      />
    );

    // Open user menu by clicking the button
    const userMenuButton = screen.getByRole('button', { name: /john doe/i });
    fireEvent.click(userMenuButton);

    await waitFor(() => {
      const orgLink = screen.getByText('Your Organization');
      expect(orgLink).toBeInTheDocument();
      expect(orgLink).toHaveAttribute('href', '/test-org');
    });
  });

  it('does not show organization link when organization is not provided', async () => {
    render(
      <AuthHeader
        user={mockUser}
        userProfile={mockUserProfile}
        userOrganization={undefined}
      />
    );

    // Open user menu
    const userMenuButton = screen.getByRole('button', { name: /john doe/i });
    fireEvent.click(userMenuButton);

    await waitFor(() => {
      expect(screen.queryByText('Your Organization')).not.toBeInTheDocument();
    });
  });

  it('shows profile link in user menu', async () => {
    render(
      <AuthHeader
        user={mockUser}
        userProfile={mockUserProfile}
        userOrganization={mockOrganization}
      />
    );

    // Open user menu
    const userMenuButton = screen.getByRole('button', { name: /john doe/i });
    fireEvent.click(userMenuButton);

    await waitFor(() => {
      const profileLink = screen.getByText('Your Profile');
      expect(profileLink).toBeInTheDocument();
      expect(profileLink).toHaveAttribute('href', '/profile');
    });
  });

  it('calls logout when sign out is clicked', async () => {
    render(
      <AuthHeader
        user={mockUser}
        userProfile={mockUserProfile}
        userOrganization={mockOrganization}
      />
    );

    // Open user menu
    const userMenuButton = screen.getByRole('button', { name: /john doe/i });
    fireEvent.click(userMenuButton);

    await waitFor(() => {
      const signOutButton = screen.getByText('Sign out');
      fireEvent.click(signOutButton);
    });

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('disables logout button while logging out', async () => {
    render(
      <AuthHeader
        user={mockUser}
        userProfile={mockUserProfile}
        userOrganization={mockOrganization}
      />
    );

    // Open user menu
    const userMenuButton = screen.getByRole('button', { name: /john doe/i });
    fireEvent.click(userMenuButton);

    await waitFor(() => {
      const signOutButton = screen.getByText('Sign out');
      fireEvent.click(signOutButton);
    });

    await waitFor(() => {
      const loggingOutButton = screen.getByText('Signing out...');
      expect(loggingOutButton).toBeDisabled();
    });
  });

  it('renders mobile navigation toggle', () => {
    render(
      <AuthHeader
        user={mockUser}
        userProfile={mockUserProfile}
        userOrganization={mockOrganization}
      />
    );

    const mobileToggle = screen.getByLabelText('Toggle Navigation');
    expect(mobileToggle).toBeInTheDocument();
  });

  it('opens mobile menu when toggle is clicked', async () => {
    render(
      <AuthHeader
        user={mockUser}
        userProfile={mockUserProfile}
        userOrganization={mockOrganization}
      />
    );

    const mobileToggle = screen.getByLabelText('Toggle Navigation');
    fireEvent.click(mobileToggle);

    await waitFor(() => {
      // Mobile menu should show Profile link
      const profileLinks = screen.getAllByText('Profile');
      expect(profileLinks.length).toBeGreaterThan(0);
    });
  });
});
