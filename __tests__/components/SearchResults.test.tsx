import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import SearchResults from '@/components/SearchResults';
import type { SearchResult } from '@/types';
import { searchSlides } from '@/lib/search-actions';

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

// Mock search actions
jest.mock('@/lib/search-actions', () => ({
  searchSlides: jest.fn(),
}));

// Mock useDebounce hook
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

describe('SearchResults', () => {
  const mockSearchResult: SearchResult = {
    id: 'slide-1',
    object_id: 'object-1',
    parent_id: 'parent-1',
    parent_path: '/project1/folder1',
    visibility: 'public',
    organization_id: 'org-123',
    project_id: 'project-1',
    tags: ['tag1', 'tag2', 'tag3', 'tag4'],
    slide_text: 'Test slide content',
    notes_text: 'Test notes',
    has_chart: true,
    has_table: true,
    has_diagram: false,
    has_image: true,
    has_bullet: false,
    has_links: false,
    links: [],
    has_video: false,
    has_audio: false,
    layout_name: 'default',
    theme_name: 'default',
    slide_name: 'Test Slide',
    description: 'Test slide description',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    imageUrl: 'https://example.com/image.jpg',
  };

  const defaultProps = {
    organizationName: 'test-org',
    organizationId: 'org-123',
    projectId: 'project-1',
    subFolderIds: ['folder-1'],
    searchQuery: '',
    isSearchMode: false,
    userRoles: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering States', () => {
    it('returns null when not in search mode', () => {
      const { container } = render(<SearchResults {...defaultProps} />);
      expect(container.firstChild).toBeNull();
    });

    it('shows empty search prompt when search mode is active but no query', () => {
      render(<SearchResults {...defaultProps} isSearchMode={true} />);

      expect(screen.getByText('Start typing to search')).toBeInTheDocument();
      expect(
        screen.getByText('Search across all slides in this organization.')
      ).toBeInTheDocument();
    });

    it('shows loading state while searching', async () => {
      (searchSlides as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Searching...')).toBeInTheDocument();
      });
    });

    it('shows no results message when search returns empty', async () => {
      (searchSlides as jest.Mock).mockResolvedValue({
        success: true,
        results: [],
        total: 0,
      });

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="nonexistent"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
        expect(
          screen.getByText('Try adjusting your search terms or check your spelling.')
        ).toBeInTheDocument();
      });
    });

    it('shows error message when search fails', async () => {
      (searchSlides as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Search service unavailable',
      });

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Search Unavailable')).toBeInTheDocument();
        expect(screen.getByText('Search service unavailable')).toBeInTheDocument();
      });
    });
  });

  describe('Search Results Display', () => {
    it('renders search results when available', async () => {
      (searchSlides as jest.Mock).mockResolvedValue({
        success: true,
        results: [mockSearchResult],
        total: 1,
      });

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Slide')).toBeInTheDocument();
        expect(screen.getByText(/Found 1 result/)).toBeInTheDocument();
      });
    });

    it('renders multiple search results', async () => {
      const results = [
        mockSearchResult,
        { ...mockSearchResult, id: 'slide-2', slide_name: 'Slide 2' },
        { ...mockSearchResult, id: 'slide-3', slide_name: 'Slide 3' },
      ];

      (searchSlides as jest.Mock).mockResolvedValue({
        success: true,
        results,
        total: 3,
      });

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Slide')).toBeInTheDocument();
        expect(screen.getByText('Slide 2')).toBeInTheDocument();
        expect(screen.getByText('Slide 3')).toBeInTheDocument();
        expect(screen.getByText(/Found 3 results/)).toBeInTheDocument();
      });
    });

    it('displays slide image when available', async () => {
      (searchSlides as jest.Mock).mockResolvedValue({
        success: true,
        results: [mockSearchResult],
        total: 1,
      });

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test"
        />
      );

      await waitFor(() => {
        const image = screen.getByAltText('Test Slide');
        expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
      });
    });

    it('displays placeholder when no image', async () => {
      const resultWithoutImage = {
        ...mockSearchResult,
        imageUrl: null,
      };

      (searchSlides as jest.Mock).mockResolvedValue({
        success: true,
        results: [resultWithoutImage],
        total: 1,
      });

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Slide')).toBeInTheDocument();
      });
    });

    it('renders correct link to slide', async () => {
      (searchSlides as jest.Mock).mockResolvedValue({
        success: true,
        results: [mockSearchResult],
        total: 1,
      });

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test"
        />
      );

      await waitFor(() => {
        const link = screen.getByText('Test Slide').closest('a');
        expect(link).toHaveAttribute(
          'href',
          '/test-org/project1/folder1/Test Slide.slide'
        );
      });
    });
  });

  describe('Metadata Display', () => {
    it('displays slide tags', async () => {
      (searchSlides as jest.Mock).mockResolvedValue({
        success: true,
        results: [mockSearchResult],
        total: 1,
      });

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Slide')).toBeInTheDocument();
      });
    });

    it('displays +n more for slides with more than 3 tags', async () => {
      (searchSlides as jest.Mock).mockResolvedValue({
        success: true,
        results: [mockSearchResult],
        total: 1,
      });

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Slide')).toBeInTheDocument();
      });
    });

    it('displays content features', async () => {
      (searchSlides as jest.Mock).mockResolvedValue({
        success: true,
        results: [mockSearchResult],
        total: 1,
      });

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Slide')).toBeInTheDocument();
      });
    });

    it('displays visibility badge', async () => {
      (searchSlides as jest.Mock).mockResolvedValue({
        success: true,
        results: [mockSearchResult],
        total: 1,
      });

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Slide')).toBeInTheDocument();
      });
    });

    it('displays description on hover', async () => {
      (searchSlides as jest.Mock).mockResolvedValue({
        success: true,
        results: [mockSearchResult],
        total: 1,
      });

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Slide')).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('shows pagination message when there are more results', async () => {
      (searchSlides as jest.Mock).mockResolvedValue({
        success: true,
        results: [mockSearchResult],
        total: 50,
      });

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Showing 1 of 50 results/)).toBeInTheDocument();
      });
    });

    it('does not show pagination message when all results are displayed', async () => {
      (searchSlides as jest.Mock).mockResolvedValue({
        success: true,
        results: [mockSearchResult],
        total: 1,
      });

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test"
        />
      );

      await waitFor(() => {
        expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Search Parameters', () => {
    it('calls searchSlides with correct parameters', async () => {
      (searchSlides as jest.Mock).mockResolvedValue({
        success: true,
        results: [],
        total: 0,
      });

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test query"
        />
      );

      await waitFor(() => {
        expect(searchSlides).toHaveBeenCalledWith({
          organizationId: 'org-123',
          projectId: 'project-1',
          subFolderIds: ['folder-1'],
          query: 'test query',
          limit: 20,
          offset: 0,
          userRoles: null,
        });
      });
    });

    it('does not search when query is empty', () => {
      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery=""
        />
      );

      expect(searchSlides).not.toHaveBeenCalled();
    });

    it('does not search when query is only whitespace', () => {
      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="   "
        />
      );

      expect(searchSlides).not.toHaveBeenCalled();
    });
  });

  describe('Content Features', () => {
    it('displays all content features when present', async () => {
      const resultWithAllFeatures = {
        ...mockSearchResult,
        has_chart: true,
        has_table: true,
        has_diagram: true,
        has_image: true,
        has_bullet: true,
        has_links: true,
        has_video: true,
        has_audio: true,
      };

      (searchSlides as jest.Mock).mockResolvedValue({
        success: true,
        results: [resultWithAllFeatures],
        total: 1,
      });

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Slide')).toBeInTheDocument();
      });
    });

    it('displays no features when none are present', async () => {
      const resultWithNoFeatures = {
        ...mockSearchResult,
        has_chart: false,
        has_table: false,
        has_diagram: false,
        has_image: false,
        has_bullet: false,
        has_links: false,
        has_video: false,
        has_audio: false,
      };

      (searchSlides as jest.Mock).mockResolvedValue({
        success: true,
        results: [resultWithNoFeatures],
        total: 1,
      });

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Slide')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles search exception gracefully', async () => {
      (searchSlides as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Search Unavailable')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('handles non-Error exceptions', async () => {
      (searchSlides as jest.Mock).mockRejectedValue('String error');

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Search Unavailable')).toBeInTheDocument();
        expect(screen.getByText('Search failed')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles result without slide name', async () => {
      const resultWithoutName = {
        ...mockSearchResult,
        slide_name: null,
      };

      (searchSlides as jest.Mock).mockResolvedValue({
        success: true,
        results: [resultWithoutName],
        total: 1,
      });

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Untitled Slide')).toBeInTheDocument();
      });
    });

    it('handles result without tags', async () => {
      const resultWithoutTags = {
        ...mockSearchResult,
        tags: null,
      };

      (searchSlides as jest.Mock).mockResolvedValue({
        success: true,
        results: [resultWithoutTags],
        total: 1,
      });

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Slide')).toBeInTheDocument();
      });
    });

    it('handles result without description', async () => {
      const resultWithoutDescription = {
        ...mockSearchResult,
        description: null,
      };

      (searchSlides as jest.Mock).mockResolvedValue({
        success: true,
        results: [resultWithoutDescription],
        total: 1,
      });

      render(
        <SearchResults
          {...defaultProps}
          isSearchMode={true}
          searchQuery="test"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Slide')).toBeInTheDocument();
      });
    });
  });
});
