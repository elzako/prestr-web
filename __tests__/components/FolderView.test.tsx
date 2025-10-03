import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FolderView from '@/components/FolderView';
import type { Organization, Folder, Presentation, Slide } from '@/types';

// Mock next/navigation
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock child components
jest.mock('@/components/Breadcrumbs', () => ({
  __esModule: true,
  default: ({ organization, currentPath }: any) => (
    <div data-testid="breadcrumbs">
      Breadcrumbs: {organization.organization_name} / {currentPath}
    </div>
  ),
}));

jest.mock('@/components/CreateFolderModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onSuccess }: any) =>
    isOpen ? (
      <div data-testid="create-folder-modal">
        <button onClick={() => { onSuccess(); onClose(); }}>Create</button>
      </div>
    ) : null,
}));

jest.mock('@/components/FolderContentList', () => ({
  __esModule: true,
  default: ({ content }: any) => (
    <div data-testid="folder-content-list">
      Content: {content.folders.length} folders, {content.presentations.length} presentations, {content.slides.length} slides
    </div>
  ),
}));

jest.mock('@/components/UploadModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onUploadSuccess }: any) =>
    isOpen ? (
      <div data-testid="upload-modal">
        <button onClick={() => { onUploadSuccess(); onClose(); }}>Upload</button>
      </div>
    ) : null,
}));

describe('FolderView', () => {
  const mockOrganization: Organization = {
    id: 'org-123',
    organization_name: 'test-org',
    tags: [],
    metadata: { name: 'Test Organization' },
  };

  const mockContent = {
    folders: [] as Folder[],
    presentations: [] as Presentation[],
    slides: [] as Slide[],
  };

  const defaultProps = {
    organization: mockOrganization,
    folderId: 'folder-123',
    folderPath: 'project1/folder1',
    content: mockContent,
    projectId: 'project-123',
    subFolderIds: [],
    userRoles: null,
  };

  beforeEach(() => {
    mockRefresh.mockClear();
  });

  it('renders breadcrumbs with organization and current path', () => {
    render(<FolderView {...defaultProps} />);

    const breadcrumbs = screen.getByTestId('breadcrumbs');
    expect(breadcrumbs).toHaveTextContent('test-org');
    expect(breadcrumbs).toHaveTextContent('project1/folder1');
  });

  it('renders folder path as title', () => {
    render(<FolderView {...defaultProps} />);

    expect(screen.getByText('project1/folder1')).toBeInTheDocument();
  });

  it('renders empty folder message when content is empty', () => {
    render(<FolderView {...defaultProps} />);

    expect(screen.getByText('This folder is empty.')).toBeInTheDocument();
  });

  it('renders item count when content exists', () => {
    const contentWithItems = {
      folders: [{} as Folder, {} as Folder],
      presentations: [{} as Presentation],
      slides: [{} as Slide, {} as Slide, {} as Slide],
    };

    render(<FolderView {...defaultProps} content={contentWithItems} />);

    expect(screen.getByText(/2 folders, 1 presentation, 3 slides/)).toBeInTheDocument();
  });

  it('uses singular form for single items', () => {
    const contentWithSingleItems = {
      folders: [{} as Folder],
      presentations: [{} as Presentation],
      slides: [{} as Slide],
    };

    render(<FolderView {...defaultProps} content={contentWithSingleItems} />);

    expect(screen.getByText(/1 folder, 1 presentation, 1 slide/)).toBeInTheDocument();
  });

  it('renders New Folder button', () => {
    render(<FolderView {...defaultProps} />);

    expect(screen.getByText('New Folder')).toBeInTheDocument();
  });

  it('renders Upload button', () => {
    render(<FolderView {...defaultProps} />);

    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('opens create folder modal when New Folder is clicked', () => {
    render(<FolderView {...defaultProps} />);

    const newFolderButton = screen.getByText('New Folder');
    fireEvent.click(newFolderButton);

    expect(screen.getByTestId('create-folder-modal')).toBeInTheDocument();
  });

  it('opens upload modal when Upload is clicked', () => {
    render(<FolderView {...defaultProps} />);

    const uploadButton = screen.getByText('Upload');
    fireEvent.click(uploadButton);

    expect(screen.getByTestId('upload-modal')).toBeInTheDocument();
  });

  it('refreshes router when upload succeeds', () => {
    render(<FolderView {...defaultProps} />);

    // Open upload modal
    const uploadButton = screen.getByText('Upload');
    fireEvent.click(uploadButton);

    // Click upload in modal - get all buttons and click the one inside modal
    const uploadModalButtons = screen.getAllByRole('button', { name: 'Upload' });
    const uploadModalButton = uploadModalButtons[uploadModalButtons.length - 1]; // Last one should be in modal
    fireEvent.click(uploadModalButton);

    expect(mockRefresh).toHaveBeenCalled();
  });

  it('refreshes router when folder creation succeeds', () => {
    render(<FolderView {...defaultProps} />);

    // Open create folder modal
    const newFolderButton = screen.getByText('New Folder');
    fireEvent.click(newFolderButton);

    // Click create in modal
    const createButton = screen.getByRole('button', { name: 'Create' });
    fireEvent.click(createButton);

    expect(mockRefresh).toHaveBeenCalled();
  });

  it('renders FolderContentList with correct props', () => {
    render(<FolderView {...defaultProps} />);

    const contentList = screen.getByTestId('folder-content-list');
    expect(contentList).toBeInTheDocument();
    expect(contentList).toHaveTextContent('Content: 0 folders, 0 presentations, 0 slides');
  });

  it('passes organization ID to upload modal', () => {
    render(<FolderView {...defaultProps} />);

    const uploadButton = screen.getByText('Upload');
    fireEvent.click(uploadButton);

    // Modal should be rendered, indicating organizationId was passed
    expect(screen.getByTestId('upload-modal')).toBeInTheDocument();
  });

  it('passes parent folder ID to create folder modal', () => {
    render(<FolderView {...defaultProps} />);

    const newFolderButton = screen.getByText('New Folder');
    fireEvent.click(newFolderButton);

    // Modal should be rendered, indicating parentFolderId was passed
    expect(screen.getByTestId('create-folder-modal')).toBeInTheDocument();
  });
});
