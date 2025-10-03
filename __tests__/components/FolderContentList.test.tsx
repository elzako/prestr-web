import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FolderContentList from '@/components/FolderContentList';
import type { Folder, Presentation, Slide } from '@/types';

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

// Mock child components
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

jest.mock('@/components/ConfirmDialog', () => ({
  __esModule: true,
  default: ({ isOpen, onConfirm, title, message }: any) =>
    isOpen ? (
      <div data-testid="confirm-dialog">
        <h3>{title}</h3>
        <p>{message}</p>
        <button onClick={onConfirm}>Confirm</button>
      </div>
    ) : null,
}));

jest.mock('@/components/CreateFolderModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/EditFolderModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/UploadModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/SearchResults', () => ({
  __esModule: true,
  default: ({ searchQuery, isSearchMode }: any) =>
    isSearchMode ? (
      <div data-testid="search-results">
        Searching for: {searchQuery}
      </div>
    ) : null,
}));

// Mock folder actions
jest.mock('@/lib/folder-actions', () => ({
  deleteFolder: jest.fn().mockResolvedValue({ success: true }),
}));

describe('FolderContentList', () => {
  const mockFolder: Folder = {
    id: 'folder-1',
    folder_name: 'Test Folder',
    organization_id: 'org-123',
    parent_id: null,
    full_path: '/test-folder',
    visibility: 'public',
    tags: ['tag1', 'tag2'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    metadata: undefined,
    deleted_at: null,
  };

  const mockPresentation: Presentation = {
    id: 'pres-1',
    parent_id: 'folder-1',
    presentation_name: 'Test Presentation',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    metadata: { description: 'A test presentation' },
    tags: [],
    deleted_at: null,
  };

  const mockSlide: Slide = {
    id: 'slide-1',
    object_id: 'object-1',
    parent_id: 'folder-1',
    slide_name: 'Test Slide',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    metadata: { textContent: ['Slide content'] },
    tags: [],
    deleted_at: null,
  };

  const defaultProps = {
    content: {
      folders: [],
      presentations: [],
      slides: [],
    },
    organizationName: 'test-org',
    currentFolderPath: 'project1/folder1',
    organizationId: 'org-123',
    currentFolderId: 'folder-1',
    projectId: 'project-123',
    subFolderIds: [],
    userRoles: null,
  };

  it('renders empty folder message when no content', () => {
    render(<FolderContentList {...defaultProps} />);

    expect(screen.getByText('Empty folder')).toBeInTheDocument();
    expect(
      screen.getByText("This folder doesn't contain any items yet.")
    ).toBeInTheDocument();
  });

  it('renders folders when provided', () => {
    const props = {
      ...defaultProps,
      content: { folders: [mockFolder], presentations: [], slides: [] },
    };

    render(<FolderContentList {...props} />);

    expect(screen.getByText('Folders (1)')).toBeInTheDocument();
    expect(screen.getByText('Test Folder')).toBeInTheDocument();
  });

  it('renders presentations when provided', () => {
    const props = {
      ...defaultProps,
      content: { folders: [], presentations: [mockPresentation], slides: [] },
    };

    render(<FolderContentList {...props} />);

    expect(screen.getByText('Presentations (1)')).toBeInTheDocument();
    expect(screen.getByText('Test Presentation')).toBeInTheDocument();
  });

  it('renders slides when provided', () => {
    const props = {
      ...defaultProps,
      content: { folders: [], presentations: [], slides: [mockSlide] },
    };

    render(<FolderContentList {...props} />);

    expect(screen.getByText('Slides (1)')).toBeInTheDocument();
    expect(screen.getByText('Test Slide')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<FolderContentList {...defaultProps} content={{ folders: [mockFolder], presentations: [], slides: [] }} />);

    const searchInput = screen.getByPlaceholderText(
      'Search slides by content, tags, or features...'
    );
    expect(searchInput).toBeInTheDocument();
  });

  it('activates search mode on input focus', () => {
    render(<FolderContentList {...defaultProps} content={{ folders: [mockFolder], presentations: [], slides: [] }} />);

    const searchInput = screen.getByPlaceholderText(
      'Search slides by content, tags, or features...'
    );

    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    expect(screen.getByTestId('search-results')).toBeInTheDocument();
  });

  it('shows action dropdown for folders', () => {
    const props = {
      ...defaultProps,
      content: { folders: [mockFolder], presentations: [], slides: [] },
    };

    render(<FolderContentList {...props} />);

    expect(screen.getByTestId('action-dropdown')).toBeInTheDocument();
  });

  it('opens delete confirmation when delete is clicked', async () => {
    const props = {
      ...defaultProps,
      content: { folders: [mockFolder], presentations: [], slides: [] },
    };

    render(<FolderContentList {...props} />);

    const deleteButtons = screen.getAllByText('Delete folder');
    const deleteButton = deleteButtons[0]; // Get the first one (the button, not the dialog title)
    fireEvent.click(deleteButton);

    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    expect(screen.getAllByText('Delete folder').length).toBeGreaterThan(1); // Button and dialog title
  });

  it('renders folder with visibility badge', () => {
    const props = {
      ...defaultProps,
      content: { folders: [mockFolder], presentations: [], slides: [] },
    };

    render(<FolderContentList {...props} />);

    expect(screen.getByText('public')).toBeInTheDocument();
  });

  it('renders folder tags', () => {
    const props = {
      ...defaultProps,
      content: { folders: [mockFolder], presentations: [], slides: [] },
    };

    render(<FolderContentList {...props} />);

    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  it('renders presentation with description', () => {
    const props = {
      ...defaultProps,
      content: { folders: [], presentations: [mockPresentation], slides: [] },
    };

    render(<FolderContentList {...props} />);

    expect(screen.getByText('A test presentation')).toBeInTheDocument();
  });

  it('renders slide with image', () => {
    const props = {
      ...defaultProps,
      content: { folders: [], presentations: [], slides: [mockSlide] },
    };

    render(<FolderContentList {...props} />);

    expect(screen.getByText('Test Slide')).toBeInTheDocument();
  });

  it('renders correct links for folder navigation', () => {
    const props = {
      ...defaultProps,
      content: { folders: [mockFolder], presentations: [], slides: [] },
    };

    render(<FolderContentList {...props} />);

    const link = screen.getByText('Open folder →');
    expect(link).toHaveAttribute(
      'href',
      '/test-org/project1/folder1/Test Folder'
    );
  });

  it('renders correct links for presentation viewing', () => {
    const props = {
      ...defaultProps,
      content: { folders: [], presentations: [mockPresentation], slides: [] },
    };

    render(<FolderContentList {...props} />);

    const link = screen.getByText('View presentation →');
    expect(link).toHaveAttribute(
      'href',
      '/test-org/project1/folder1/Test Presentation.presentation'
    );
  });

  it('renders correct links for slide viewing', () => {
    const props = {
      ...defaultProps,
      content: { folders: [], presentations: [], slides: [mockSlide] },
    };

    render(<FolderContentList {...props} />);

    const link = screen.getByText('View slide →');
    expect(link).toHaveAttribute(
      'href',
      '/test-org/project1/folder1/Test Slide.slide'
    );
  });
});
