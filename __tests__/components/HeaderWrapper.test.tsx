import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeaderWrapper } from '@/components/HeaderWrapper';
import type { User } from '@supabase/supabase-js';
import type { UserProfile, Organization } from '@/types';

// Mock auth actions
const mockGetUser = jest.fn();
const mockGetUserProfile = jest.fn();
const mockGetUserOrganization = jest.fn();

jest.mock('@/lib/auth-actions', () => ({
  getUser: () => mockGetUser(),
  getUserProfile: () => mockGetUserProfile(),
  getUserOrganization: () => mockGetUserOrganization(),
}));

// Mock Header component
jest.mock('@/components/Header', () => ({
  Header: () => <div data-testid="header">Public Header</div>,
}));

// Mock AuthHeader component
jest.mock('@/components/AuthHeader', () => ({
  AuthHeader: ({ user, userProfile, userOrganization }: any) => (
    <div data-testid="auth-header">
      <div data-testid="user-email">{user?.email}</div>
      <div data-testid="user-profile">
        {userProfile?.metadata?.firstName || 'No Profile'}
      </div>
      <div data-testid="user-org">
        {userOrganization?.organization_name || 'No Org'}
      </div>
    </div>
  ),
}));

describe('HeaderWrapper', () => {
  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
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
    },
  };

  const mockOrganization: Organization = {
    id: 'org-123',
    organization_name: 'test-org',
    tags: [],
    metadata: undefined,
  };

  beforeEach(() => {
    mockGetUser.mockClear();
    mockGetUserProfile.mockClear();
    mockGetUserOrganization.mockClear();
  });

  it('renders public Header when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue(null);

    const result = await HeaderWrapper();
    render(result);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('Public Header')).toBeInTheDocument();
    expect(screen.queryByTestId('auth-header')).not.toBeInTheDocument();
  });

  it('renders AuthHeader when user is authenticated', async () => {
    mockGetUser.mockResolvedValue(mockUser);
    mockGetUserProfile.mockResolvedValue(mockUserProfile);
    mockGetUserOrganization.mockResolvedValue(mockOrganization);

    const result = await HeaderWrapper();
    render(result);

    expect(screen.getByTestId('auth-header')).toBeInTheDocument();
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
  });

  it('passes user data to AuthHeader', async () => {
    mockGetUser.mockResolvedValue(mockUser);
    mockGetUserProfile.mockResolvedValue(mockUserProfile);
    mockGetUserOrganization.mockResolvedValue(mockOrganization);

    const result = await HeaderWrapper();
    render(result);

    expect(screen.getByTestId('user-email')).toHaveTextContent(
      'test@example.com'
    );
  });

  it('passes user profile to AuthHeader', async () => {
    mockGetUser.mockResolvedValue(mockUser);
    mockGetUserProfile.mockResolvedValue(mockUserProfile);
    mockGetUserOrganization.mockResolvedValue(mockOrganization);

    const result = await HeaderWrapper();
    render(result);

    expect(screen.getByTestId('user-profile')).toHaveTextContent('John');
  });

  it('passes organization to AuthHeader', async () => {
    mockGetUser.mockResolvedValue(mockUser);
    mockGetUserProfile.mockResolvedValue(mockUserProfile);
    mockGetUserOrganization.mockResolvedValue(mockOrganization);

    const result = await HeaderWrapper();
    render(result);

    expect(screen.getByTestId('user-org')).toHaveTextContent('test-org');
  });

  it('handles missing user profile gracefully', async () => {
    mockGetUser.mockResolvedValue(mockUser);
    mockGetUserProfile.mockResolvedValue(null);
    mockGetUserOrganization.mockResolvedValue(mockOrganization);

    const result = await HeaderWrapper();
    render(result);

    expect(screen.getByTestId('auth-header')).toBeInTheDocument();
    expect(screen.getByTestId('user-profile')).toHaveTextContent('No Profile');
  });

  it('handles missing organization gracefully', async () => {
    mockGetUser.mockResolvedValue(mockUser);
    mockGetUserProfile.mockResolvedValue(mockUserProfile);
    mockGetUserOrganization.mockResolvedValue(null);

    const result = await HeaderWrapper();
    render(result);

    expect(screen.getByTestId('auth-header')).toBeInTheDocument();
    expect(screen.getByTestId('user-org')).toHaveTextContent('No Org');
  });

  it('fetches user profile and organization in parallel', async () => {
    mockGetUser.mockResolvedValue(mockUser);
    mockGetUserProfile.mockResolvedValue(mockUserProfile);
    mockGetUserOrganization.mockResolvedValue(mockOrganization);

    await HeaderWrapper();

    expect(mockGetUser).toHaveBeenCalledTimes(1);
    expect(mockGetUserProfile).toHaveBeenCalledTimes(1);
    expect(mockGetUserOrganization).toHaveBeenCalledTimes(1);
  });
});
