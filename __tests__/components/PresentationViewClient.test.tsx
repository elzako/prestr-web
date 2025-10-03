import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PresentationViewClient from '@/components/PresentationViewClient';
import type { Organization, PresentationDetail } from '@/types';

// Mock child components
jest.mock('@/components/EditPresentationModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, presentation }: any) =>
    isOpen ? (
      <div data-testid="edit-presentation-modal">
        <p>Editing: {presentation?.presentation_name}</p>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

jest.mock('@/components/SlideGallery', () => ({
  __esModule: true,
  default: ({ slides, organizationName, folderPath, presentationName }: any) => (
    <div data-testid="slide-gallery">
      <div data-testid="gallery-org">{organizationName}</div>
      <div data-testid="gallery-path">{folderPath}</div>
      <div data-testid="gallery-presentation">{presentationName}</div>
      <div data-testid="gallery-slide-count">{slides.length}</div>
    </div>
  ),
}));

describe('PresentationViewClient', () => {
  beforeEach(() => {
    // Use global helper to properly mock location
    (global as any).mockWindowLocation({ reload: jest.fn() });
  });
  const mockOrganization: Organization = {
    id: 'org-123',
    organization_name: 'test-org',
    tags: [],
    metadata: undefined,
  };

  const mockPresentation: PresentationDetail = {
    id: 'pres-123',
    presentation_name: 'Test Presentation',
    parent_id: 'folder-123',
    tags: ['tag1', 'tag2', 'tag3'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    metadata: undefined,
    slides: undefined,
    settings: {
      pptxDownloadRole: 'public' as const,
      pdfDownloadRole: 'public' as const,
      chatRole: 'public' as const,
    },
    version: 1,
  };

  const mockSlideData = [
    {
      order: 1,
      slide_id: 'slide-1',
      object_id: 'object-1',
      imageUrl: 'https://example.com/slide-1.jpg',
    },
    {
      order: 2,
      slide_id: 'slide-2',
      object_id: 'object-2',
      imageUrl: 'https://example.com/slide-2.jpg',
    },
  ];

  const defaultProps = {
    presentation: mockPresentation,
    organization: mockOrganization,
    folderPath: 'project1/folder1',
    canEdit: false,
    slideData: mockSlideData,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders presentation name', () => {
      render(<PresentationViewClient {...defaultProps} />);

      const presentationNames = screen.getAllByText('Test Presentation');
      expect(presentationNames.length).toBeGreaterThan(0);
    });

    it('renders breadcrumb navigation', () => {
      render(<PresentationViewClient {...defaultProps} />);

      // Home icon should be present
      const homeLinks = screen.getAllByRole('link');
      expect(homeLinks[0]).toHaveAttribute('href', '/test-org');

      // Folder path link
      expect(homeLinks[1]).toHaveAttribute('href', '/test-org/project1/folder1');
      const folderPaths = screen.getAllByText('project1/folder1');
      expect(folderPaths.length).toBeGreaterThan(0);
    });

    it('renders slide gallery', () => {
      render(<PresentationViewClient {...defaultProps} />);

      expect(screen.getByTestId('slide-gallery')).toBeInTheDocument();
      expect(screen.getByTestId('gallery-org')).toHaveTextContent('test-org');
      expect(screen.getByTestId('gallery-path')).toHaveTextContent('project1/folder1');
      expect(screen.getByTestId('gallery-presentation')).toHaveTextContent('Test Presentation');
      expect(screen.getByTestId('gallery-slide-count')).toHaveTextContent('2');
    });

    it('renders presentation tags', () => {
      render(<PresentationViewClient {...defaultProps} />);

      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
      expect(screen.getByText('tag3')).toBeInTheDocument();
    });

    it('does not render tags section when no tags', () => {
      const presentationWithoutTags: PresentationDetail = {
        ...mockPresentation,
        tags: [],
      };

      render(
        <PresentationViewClient
          {...defaultProps}
          presentation={presentationWithoutTags}
        />
      );

      expect(screen.queryByText('tag1')).not.toBeInTheDocument();
    });

    it('does not render tags section when empty tags array', () => {
      const presentationWithEmptyTags = {
        ...mockPresentation,
        tags: [],
      };

      render(
        <PresentationViewClient
          {...defaultProps}
          presentation={presentationWithEmptyTags}
        />
      );

      expect(screen.queryByText('tag1')).not.toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    it('does not show edit button when canEdit is false', () => {
      render(<PresentationViewClient {...defaultProps} />);

      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });

    it('shows edit button when canEdit is true', () => {
      render(<PresentationViewClient {...defaultProps} canEdit={true} />);

      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('opens edit modal when edit button is clicked', () => {
      render(<PresentationViewClient {...defaultProps} canEdit={true} />);

      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);

      expect(screen.getByTestId('edit-presentation-modal')).toBeInTheDocument();
      expect(screen.getByText('Editing: Test Presentation')).toBeInTheDocument();
    });

    it('closes edit modal when close is clicked', () => {
      render(<PresentationViewClient {...defaultProps} canEdit={true} />);

      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);

      expect(screen.getByTestId('edit-presentation-modal')).toBeInTheDocument();

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('edit-presentation-modal')).not.toBeInTheDocument();
    });

    it('does not render edit modal when canEdit is false', () => {
      render(<PresentationViewClient {...defaultProps} canEdit={false} />);

      expect(screen.queryByTestId('edit-presentation-modal')).not.toBeInTheDocument();
    });
  });

  describe('Breadcrumb Navigation', () => {
    it('renders home icon with correct link', () => {
      render(<PresentationViewClient {...defaultProps} />);

      const homeLinks = screen.getAllByRole('link');
      expect(homeLinks[0]).toHaveAttribute('href', '/test-org');
    });

    it('renders folder path link', () => {
      render(<PresentationViewClient {...defaultProps} />);

      const folderLink = screen.getAllByRole('link')[1];
      expect(folderLink).toHaveAttribute('href', '/test-org/project1/folder1');
    });

    it('renders presentation name as current location', () => {
      render(<PresentationViewClient {...defaultProps} />);

      // Should appear twice - once in breadcrumb, once in header
      const presentationNames = screen.getAllByText('Test Presentation');
      expect(presentationNames.length).toBeGreaterThanOrEqual(2);
    });

    it('handles different folder paths correctly', () => {
      const { rerender } = render(<PresentationViewClient {...defaultProps} />);

      const initialPaths = screen.getAllByText('project1/folder1');
      expect(initialPaths.length).toBeGreaterThan(0);

      rerender(
        <PresentationViewClient {...defaultProps} folderPath="different/path" />
      );

      const newPaths = screen.getAllByText('different/path');
      expect(newPaths.length).toBeGreaterThan(0);
      expect(screen.queryByText('project1/folder1')).not.toBeInTheDocument();
    });
  });

  describe('Slide Gallery Integration', () => {
    it('passes correct props to SlideGallery', () => {
      render(<PresentationViewClient {...defaultProps} />);

      expect(screen.getByTestId('gallery-org')).toHaveTextContent('test-org');
      expect(screen.getByTestId('gallery-path')).toHaveTextContent('project1/folder1');
      expect(screen.getByTestId('gallery-presentation')).toHaveTextContent('Test Presentation');
    });

    it('passes slide data to SlideGallery', () => {
      render(<PresentationViewClient {...defaultProps} />);

      expect(screen.getByTestId('gallery-slide-count')).toHaveTextContent('2');
    });

    it('handles empty slide data', () => {
      render(<PresentationViewClient {...defaultProps} slideData={[]} />);

      expect(screen.getByTestId('gallery-slide-count')).toHaveTextContent('0');
    });

    it('handles large number of slides', () => {
      const manySlides = Array.from({ length: 50 }, (_, i) => ({
        order: i + 1,
        slide_id: `slide-${i + 1}`,
        object_id: `object-${i + 1}`,
        imageUrl: `https://example.com/slide-${i + 1}.jpg`,
      }));

      render(<PresentationViewClient {...defaultProps} slideData={manySlides} />);

      expect(screen.getByTestId('gallery-slide-count')).toHaveTextContent('50');
    });
  });

  describe('Layout', () => {
    it('renders content in white card', () => {
      const { container } = render(<PresentationViewClient {...defaultProps} />);

      const card = container.querySelector('.bg-white.shadow');
      expect(card).toBeInTheDocument();
    });

    it('renders header with proper spacing', () => {
      render(<PresentationViewClient {...defaultProps} />);

      const headers = screen.getAllByText('Test Presentation');
      const h1 = headers.find(el => el.tagName === 'H1');
      expect(h1).toHaveClass('text-2xl', 'font-bold', 'text-gray-900');
    });
  });

  describe('Accessibility', () => {
    it('renders breadcrumb with aria-label', () => {
      render(<PresentationViewClient {...defaultProps} />);

      const breadcrumb = screen.getByLabelText('Breadcrumb');
      expect(breadcrumb).toBeInTheDocument();
    });

    it('renders home icon with screen reader text', () => {
      render(<PresentationViewClient {...defaultProps} />);

      expect(screen.getByText('Home')).toHaveClass('sr-only');
    });

    it('has proper heading hierarchy', () => {
      const { container } = render(<PresentationViewClient {...defaultProps} />);

      const h1 = container.querySelector('h1');
      expect(h1).toHaveTextContent('Test Presentation');
    });
  });

  describe('Edge Cases', () => {
    it('handles special characters in presentation name', () => {
      const presentationWithSpecialChars = {
        ...mockPresentation,
        presentation_name: 'Test & Special <Characters>',
      };

      render(
        <PresentationViewClient
          {...defaultProps}
          presentation={presentationWithSpecialChars}
        />
      );

      const specialNames = screen.getAllByText('Test & Special <Characters>');
      expect(specialNames.length).toBeGreaterThan(0);
    });

    it('handles long presentation name', () => {
      const presentationWithLongName = {
        ...mockPresentation,
        presentation_name: 'A'.repeat(100),
      };

      render(
        <PresentationViewClient
          {...defaultProps}
          presentation={presentationWithLongName}
        />
      );

      const longNames = screen.getAllByText('A'.repeat(100));
      expect(longNames.length).toBeGreaterThan(0);
    });

    it('handles many tags', () => {
      const presentationWithManyTags = {
        ...mockPresentation,
        tags: Array.from({ length: 20 }, (_, i) => `tag${i + 1}`),
      };

      render(
        <PresentationViewClient
          {...defaultProps}
          presentation={presentationWithManyTags}
        />
      );

      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag20')).toBeInTheDocument();
    });

    it('handles deep folder paths', () => {
      const deepPath = 'project/folder1/folder2/folder3/folder4/folder5';

      render(<PresentationViewClient {...defaultProps} folderPath={deepPath} />);

      const deepPaths = screen.getAllByText(deepPath);
      expect(deepPaths.length).toBeGreaterThan(0);
    });
  });
});
