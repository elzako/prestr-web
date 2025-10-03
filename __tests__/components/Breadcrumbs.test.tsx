import React from 'react';
import { render, screen } from '@testing-library/react';
import Breadcrumbs from '@/components/Breadcrumbs';
import type { Organization } from '@/types';

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Breadcrumbs', () => {
  const mockOrganization: Organization = {
    id: '123',
    organization_name: 'test-org',
    tags: [],
    metadata: {
      name: 'Test Organization',
    },
  };

  it('renders organization name as first breadcrumb', () => {
    render(
      <Breadcrumbs organization={mockOrganization} currentPath="" />
    );

    expect(screen.getByText('Test Organization')).toBeInTheDocument();
  });

  it('uses organization_name as fallback when metadata name is not available', () => {
    const orgWithoutMetadataName = {
      ...mockOrganization,
      metadata: undefined,
    };

    render(
      <Breadcrumbs organization={orgWithoutMetadataName} currentPath="" />
    );

    expect(screen.getByText('test-org')).toBeInTheDocument();
  });

  it('renders organization as link when not on root', () => {
    render(
      <Breadcrumbs organization={mockOrganization} currentPath="folder1" />
    );

    const orgLink = screen.getByText('Test Organization');
    expect(orgLink).toHaveAttribute('href', '/test-org');
  });

  it('renders organization as current when on root path', () => {
    render(
      <Breadcrumbs organization={mockOrganization} currentPath="" />
    );

    const orgElement = screen.getByText('Test Organization');
    expect(orgElement.tagName).toBe('SPAN');
    expect(orgElement).toHaveAttribute('aria-current', 'page');
  });

  it('renders single folder path correctly', () => {
    render(
      <Breadcrumbs organization={mockOrganization} currentPath="folder1" />
    );

    expect(screen.getByText('Test Organization')).toBeInTheDocument();
    expect(screen.getByText('folder1')).toBeInTheDocument();
  });

  it('renders nested folder path correctly', () => {
    render(
      <Breadcrumbs
        organization={mockOrganization}
        currentPath="folder1/folder2/folder3"
      />
    );

    expect(screen.getByText('Test Organization')).toBeInTheDocument();
    expect(screen.getByText('folder1')).toBeInTheDocument();
    expect(screen.getByText('folder2')).toBeInTheDocument();
    expect(screen.getByText('folder3')).toBeInTheDocument();
  });

  it('marks last item as current', () => {
    render(
      <Breadcrumbs
        organization={mockOrganization}
        currentPath="folder1/folder2"
      />
    );

    const folder2 = screen.getByText('folder2');
    expect(folder2.tagName).toBe('SPAN');
    expect(folder2).toHaveAttribute('aria-current', 'page');
  });

  it('renders non-current items as links', () => {
    render(
      <Breadcrumbs
        organization={mockOrganization}
        currentPath="folder1/folder2"
      />
    );

    const orgLink = screen.getByText('Test Organization');
    expect(orgLink).toHaveAttribute('href', '/test-org');

    const folder1Link = screen.getByText('folder1');
    expect(folder1Link).toHaveAttribute('href', '/test-org/folder1');
  });

  it('renders correct href for nested paths', () => {
    render(
      <Breadcrumbs
        organization={mockOrganization}
        currentPath="folder1/folder2/folder3"
      />
    );

    const folder1 = screen.getByText('folder1');
    expect(folder1).toHaveAttribute('href', '/test-org/folder1');

    const folder2 = screen.getByText('folder2');
    expect(folder2).toHaveAttribute('href', '/test-org/folder1/folder2');
  });

  it('renders separator between breadcrumbs', () => {
    const { container } = render(
      <Breadcrumbs organization={mockOrganization} currentPath="folder1" />
    );

    const separators = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(separators.length).toBeGreaterThan(0);
  });

  it('does not render separator before first item', () => {
    render(
      <Breadcrumbs organization={mockOrganization} currentPath="folder1" />
    );

    const breadcrumbItems = screen.getAllByRole('listitem');
    const firstItem = breadcrumbItems[0];

    // First item should not contain a separator SVG
    expect(firstItem.querySelector('svg')).toBeNull();
  });

  it('has correct ARIA label on navigation', () => {
    const { container } = render(
      <Breadcrumbs organization={mockOrganization} currentPath="" />
    );

    const nav = container.querySelector('nav[aria-label="Breadcrumb"]');
    expect(nav).toBeInTheDocument();
  });

  it('handles paths with trailing slashes', () => {
    render(
      <Breadcrumbs organization={mockOrganization} currentPath="folder1/" />
    );

    expect(screen.getByText('folder1')).toBeInTheDocument();
  });

  it('handles empty path segments correctly', () => {
    render(
      <Breadcrumbs organization={mockOrganization} currentPath="folder1//folder2" />
    );

    // Should filter out empty segments
    expect(screen.getByText('folder1')).toBeInTheDocument();
    expect(screen.getByText('folder2')).toBeInTheDocument();
  });
});
