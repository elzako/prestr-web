import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ProjectList from '@/components/ProjectList';
import type { Project } from '@/types';
import { getUserOrganizationRole, deleteProject } from '@/lib/project-actions';

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

// Mock child components
jest.mock('@/components/CreateProjectModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="create-project-modal">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

jest.mock('@/components/EditProjectModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, project }: any) =>
    isOpen ? (
      <div data-testid="edit-project-modal">
        <p>Editing: {project?.folder_name}</p>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

jest.mock('@/components/ConfirmDialog', () => ({
  __esModule: true,
  default: ({ isOpen, onConfirm, title, message, loading }: any) =>
    isOpen ? (
      <div data-testid="confirm-dialog">
        <h3>{title}</h3>
        <p>{message}</p>
        <button onClick={() => onConfirm?.()} disabled={loading}>
          {loading ? 'Deleting...' : 'Confirm'}
        </button>
      </div>
    ) : null,
}));

jest.mock('@/components/SearchResults', () => ({
  __esModule: true,
  default: ({ searchQuery, isSearchMode }: any) =>
    isSearchMode ? (
      <div data-testid="search-results">Searching for: {searchQuery}</div>
    ) : null,
}));

// Mock Headless UI components
jest.mock('@headlessui/react', () => ({
  Menu: ({ children }: any) => <div data-testid="menu">{children}</div>,
  MenuButton: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  MenuItem: ({ children }: any) => <div>{children}</div>,
  MenuItems: ({ children }: any) => <div data-testid="menu-items">{children}</div>,
}));

// Mock project actions
jest.mock('@/lib/project-actions', () => ({
  getUserOrganizationRole: jest.fn(),
  deleteProject: jest.fn(),
}));

describe('ProjectList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockProject: Project = {
    id: 'project-1',
    folder_name: 'Test Project',
    organization_id: 'org-123',
    parent_id: null,
    full_path: '/test-project',
    visibility: 'public',
    tags: ['tag1', 'tag2', 'tag3', 'tag4'],
    created_at: '2024-01-01',
    updated_at: '2024-01-15T10:30:00Z',
    metadata: { description: 'Test project description' },
    deleted_at: null,
  };

  const defaultProps = {
    projects: [],
    organizationName: 'test-org',
    organizationId: 'org-123',
    userRoles: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getUserOrganizationRole as jest.Mock).mockResolvedValue({
      success: true,
      role: 'member',
    });
  });

  describe('Empty State', () => {
    it('renders empty state when no projects', () => {
      render(<ProjectList {...defaultProps} />);

      expect(screen.getByText('No projects')).toBeInTheDocument();
      expect(
        screen.getByText("This organization hasn't created any projects yet.")
      ).toBeInTheDocument();
    });

    it('does not show create button in empty state for non-admin users', async () => {
      render(<ProjectList {...defaultProps} />);

      await waitFor(() => {
        expect(getUserOrganizationRole).toHaveBeenCalledWith('test-org');
      });

      // Wait for role check to complete
      await waitFor(() => {
        const createButtons = screen.queryAllByText(/Create/);
        expect(createButtons.length).toBe(0);
      });
    });

    it('shows create button in empty state for admin users', async () => {
      (getUserOrganizationRole as jest.Mock).mockResolvedValue({
        success: true,
        role: 'admin',
      });

      render(<ProjectList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Create your first project')).toBeInTheDocument();
      });
    });
  });

  describe('Projects Display', () => {
    it('renders project cards when projects exist', () => {
      const props = {
        ...defaultProps,
        projects: [mockProject],
      };

      render(<ProjectList {...props} />);

      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('Test project description')).toBeInTheDocument();
    });

    it('renders multiple projects', () => {
      const projects = [
        mockProject,
        { ...mockProject, id: 'project-2', folder_name: 'Project 2' },
        { ...mockProject, id: 'project-3', folder_name: 'Project 3' },
      ];

      render(<ProjectList {...defaultProps} projects={projects} />);

      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
      expect(screen.getByText('Project 3')).toBeInTheDocument();
    });

    it('displays project tags', () => {
      render(<ProjectList {...defaultProps} projects={[mockProject]} />);

      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
      expect(screen.getByText('tag3')).toBeInTheDocument();
    });

    it('displays +n more for projects with more than 3 tags', () => {
      render(<ProjectList {...defaultProps} projects={[mockProject]} />);

      expect(screen.getByText('+1 more')).toBeInTheDocument();
    });

    it('displays visibility badge', () => {
      render(<ProjectList {...defaultProps} projects={[mockProject]} />);

      expect(screen.getByText('public')).toBeInTheDocument();
    });

    it('renders visibility badges with correct colors', () => {
      const projects = [
        { ...mockProject, id: '1', visibility: 'public' as const },
        { ...mockProject, id: '2', folder_name: 'Internal', visibility: 'internal' as const },
        { ...mockProject, id: '3', folder_name: 'Restricted', visibility: 'restricted' as const },
      ];

      render(<ProjectList {...defaultProps} projects={projects} />);

      expect(screen.getByText('public')).toBeInTheDocument();
      expect(screen.getByText('internal')).toBeInTheDocument();
      expect(screen.getByText('restricted')).toBeInTheDocument();
    });

    it('displays formatted updated date', () => {
      render(<ProjectList {...defaultProps} projects={[mockProject]} />);

      expect(screen.getByText(/Updated/)).toBeInTheDocument();
    });

    it('renders correct link to project', () => {
      render(<ProjectList {...defaultProps} projects={[mockProject]} />);

      const link = screen.getByText('View project →');
      expect(link).toHaveAttribute('href', '/test-org/Test Project');
    });
  });

  describe('Search Functionality', () => {
    it('renders search input', () => {
      render(<ProjectList {...defaultProps} projects={[mockProject]} />);

      const searchInput = screen.getByPlaceholderText(
        'Search slides by content, tags, or features...'
      );
      expect(searchInput).toBeInTheDocument();
    });

    it('activates search mode when typing in search input', () => {
      render(<ProjectList {...defaultProps} projects={[mockProject]} />);

      const searchInput = screen.getByPlaceholderText(
        'Search slides by content, tags, or features...'
      );

      fireEvent.focus(searchInput);
      fireEvent.change(searchInput, { target: { value: 'test query' } });

      expect(screen.getByTestId('search-results')).toBeInTheDocument();
    });

    it('shows clear button when in search mode with query', () => {
      render(<ProjectList {...defaultProps} projects={[mockProject]} />);

      const searchInput = screen.getByPlaceholderText(
        'Search slides by content, tags, or features...'
      );

      fireEvent.focus(searchInput);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const clearButton = screen.getByRole('button', { hidden: true });
      expect(clearButton).toBeInTheDocument();
    });

    it('exits search mode when clear button is clicked', () => {
      render(<ProjectList {...defaultProps} projects={[mockProject]} />);

      const searchInput = screen.getByPlaceholderText(
        'Search slides by content, tags, or features...'
      );

      fireEvent.focus(searchInput);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const clearButton = screen.getByRole('button', { hidden: true });
      fireEvent.click(clearButton);

      expect(screen.queryByTestId('search-results')).not.toBeInTheDocument();
      expect(searchInput).toHaveValue('');
    });

    it('shows project grid when not in search mode', () => {
      render(<ProjectList {...defaultProps} projects={[mockProject]} />);

      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.queryByTestId('search-results')).not.toBeInTheDocument();
    });
  });

  describe('Admin Actions', () => {
    beforeEach(() => {
      (getUserOrganizationRole as jest.Mock).mockResolvedValue({
        success: true,
        role: 'admin',
      });
    });

    it('shows create project button for admin users', async () => {
      render(<ProjectList {...defaultProps} projects={[mockProject]} />);

      await waitFor(() => {
        expect(screen.getByText('Create Project')).toBeInTheDocument();
      });
    });

    it('shows action menu for admin users', async () => {
      render(<ProjectList {...defaultProps} projects={[mockProject]} />);

      await waitFor(() => {
        expect(screen.getByTestId('menu')).toBeInTheDocument();
      });
    });

    it('opens create modal when create button is clicked', async () => {
      render(<ProjectList {...defaultProps} projects={[mockProject]} />);

      await waitFor(() => {
        const createButton = screen.getByText('Create Project');
        fireEvent.click(createButton);
      });

      expect(screen.getByTestId('create-project-modal')).toBeInTheDocument();
    });

    it('opens edit modal when edit action is clicked', async () => {
      render(<ProjectList {...defaultProps} projects={[mockProject]} />);

      await waitFor(() => {
        const editButton = screen.getByText('Edit Project');
        fireEvent.click(editButton);
      });

      expect(screen.getByTestId('edit-project-modal')).toBeInTheDocument();
      expect(screen.getByText('Editing: Test Project')).toBeInTheDocument();
    });

    it('opens delete confirmation when delete action is clicked', async () => {
      render(<ProjectList {...defaultProps} projects={[mockProject]} />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Delete Project');
        const deleteButton = deleteButtons[0];
        fireEvent.click(deleteButton);
      });

      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      expect(screen.getAllByText('Delete Project').length).toBeGreaterThan(1); // Button and dialog title
    });

    it('calls deleteProject when delete is confirmed', async () => {
      (deleteProject as jest.Mock).mockResolvedValue({ success: true });

      render(<ProjectList {...defaultProps} projects={[mockProject]} />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Delete Project');
        const deleteButton = deleteButtons[0];
        fireEvent.click(deleteButton);
      });

      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(deleteProject).toHaveBeenCalledWith('test-org', 'project-1');
      });
    });
  });

  describe('Owner Actions', () => {
    beforeEach(() => {
      (getUserOrganizationRole as jest.Mock).mockResolvedValue({
        success: true,
        role: 'owner',
      });
    });

    it('shows admin actions for owner users', async () => {
      render(<ProjectList {...defaultProps} projects={[mockProject]} />);

      await waitFor(() => {
        expect(screen.getByText('Create Project')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles project without description', () => {
      const projectWithoutDescription = {
        ...mockProject,
        metadata: {},
      };

      render(
        <ProjectList {...defaultProps} projects={[projectWithoutDescription]} />
      );

      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(
        screen.queryByText('Test project description')
      ).not.toBeInTheDocument();
    });

    it('handles project without tags', () => {
      const projectWithoutTags = {
        ...mockProject,
        tags: [],
      };

      render(<ProjectList {...defaultProps} projects={[projectWithoutTags]} />);

      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.queryByText('tag1')).not.toBeInTheDocument();
    });

    it('handles project without visibility', () => {
      const projectWithoutVisibility = {
        ...mockProject,
        visibility: null,
      };

      render(
        <ProjectList {...defaultProps} projects={[projectWithoutVisibility]} />
      );

      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('handles failed role check gracefully', async () => {
      (getUserOrganizationRole as jest.Mock).mockResolvedValue({
        success: false,
      });

      render(<ProjectList {...defaultProps} projects={[mockProject]} />);

      await waitFor(() => {
        expect(getUserOrganizationRole).toHaveBeenCalled();
      });

      // Should still render projects
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('handles failed delete gracefully', async () => {
      (getUserOrganizationRole as jest.Mock).mockResolvedValue({
        success: true,
        role: 'admin',
      });
      (deleteProject as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Delete failed',
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<ProjectList {...defaultProps} projects={[mockProject]} />);

      await waitFor(() => {
        const deleteButton = screen.getByText('Delete Project');
        fireEvent.click(deleteButton);
      });

      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Delete failed:', 'Delete failed');
      });

      consoleSpy.mockRestore();
    });
  });
});
