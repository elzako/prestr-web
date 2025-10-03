import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SlideView from '@/components/SlideView';
import type { Organization, Slide } from '@/types';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

// Mock next/navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock child components
jest.mock('@/components/SlideEditForm', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onSuccess, slide }: any) =>
    isOpen ? (
      <div data-testid="slide-edit-form">
        <p>Editing: {slide?.slide_name}</p>
        <button onClick={onClose}>Close</button>
        <button
          onClick={() =>
            onSuccess({
              slide_name: 'Updated Slide',
              description: 'Updated description',
              tags: ['new-tag'],
            })
          }
        >
          Save
        </button>
      </div>
    ) : null,
}));

describe('SlideView', () => {
  const mockOrganization: Organization = {
    id: 'org-123',
    organization_name: 'test-org',
    tags: [],
    metadata: undefined,
  };

  const mockSlide = {
    id: 'slide-123',
    slide_name: 'Test Slide',
    description: 'Test slide description',
    tags: ['tag1', 'tag2'],
    visibility: 'public' as const,
    parent_id: 'pres-123',
    object_id: 'object-123',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    metadata: {
      slideNumber: 5,
      slide_text: 'Slide content text',
      presentationTitle: 'Test Presentation',
      presentationFileName: 'test-presentation.pptx',
      url: 'https://example.com/original',
    },
  };

  const defaultProps = {
    slide: mockSlide,
    organization: mockOrganization,
    folderPath: 'project1/folder1',
    imageUrl: 'https://example.com/slide.jpg',
    canEdit: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(),
      toString: jest.fn(() => ''),
    });
    (usePathname as jest.Mock).mockReturnValue('/test-org/project1/folder1/Test Slide.slide');

    // Reset body overflow style
    document.body.style.overflow = 'unset';
  });

  afterEach(() => {
    // Clean up event listeners
    document.body.style.overflow = 'unset';
  });

  describe('Rendering', () => {
    it('renders slide name', () => {
      render(<SlideView {...defaultProps} />);

      expect(screen.getByText('Test Slide')).toBeInTheDocument();
    });

    it('renders slide image', () => {
      render(<SlideView {...defaultProps} />);

      const image = screen.getByAltText('Slide content text');
      expect(image).toHaveAttribute('src', 'https://example.com/slide.jpg');
    });

    it('renders breadcrumb navigation', () => {
      render(<SlideView {...defaultProps} />);

      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/test-org');
      expect(links[1]).toHaveAttribute('href', '/test-org/project1/folder1');
    });

    it('renders slide metadata', () => {
      render(<SlideView {...defaultProps} />);

      expect(screen.getByText('Slide Number')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders presentation context', () => {
      render(<SlideView {...defaultProps} />);

      expect(screen.getByText('Presentation Context')).toBeInTheDocument();
      expect(screen.getByText('Presentation Title')).toBeInTheDocument();
      expect(screen.getByText('Test Presentation')).toBeInTheDocument();
      expect(screen.getByText('File Name')).toBeInTheDocument();
      expect(screen.getByText('test-presentation.pptx')).toBeInTheDocument();
    });

    it('renders visibility badge', () => {
      render(<SlideView {...defaultProps} />);

      expect(screen.getByText('public')).toBeInTheDocument();
    });

    it('renders tags', () => {
      render(<SlideView {...defaultProps} />);

      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
    });

    it('renders view original button when URL exists', () => {
      render(<SlideView {...defaultProps} />);

      const viewButton = screen.getByText('View Original');
      expect(viewButton).toHaveAttribute('href', 'https://example.com/original');
      expect(viewButton).toHaveAttribute('target', '_blank');
      expect(viewButton).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Lightbox Functionality', () => {
    it('opens lightbox when image is clicked', () => {
      render(<SlideView {...defaultProps} />);

      const image = screen.getByAltText('Slide content text');
      fireEvent.click(image);

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('lightbox=true'),
        expect.objectContaining({ scroll: false })
      );
    });

    it('opens lightbox when expand button is clicked', () => {
      render(<SlideView {...defaultProps} />);

      const expandButton = screen.getByLabelText('Open lightbox');
      fireEvent.click(expandButton);

      expect(mockReplace).toHaveBeenCalled();
    });

    it('opens lightbox when URL has lightbox parameter', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => (param === 'lightbox' ? 'true' : null),
        toString: jest.fn(() => 'lightbox=true'),
      });

      render(<SlideView {...defaultProps} />);

      // Lightbox should be open (indicated by body overflow being hidden)
      waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden');
      });
    });

    it('closes lightbox on escape key', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => (param === 'lightbox' ? 'true' : null),
        toString: jest.fn(() => 'lightbox=true'),
      });

      render(<SlideView {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockReplace).toHaveBeenCalled();
    });

    it('prevents body scroll when lightbox is open', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => (param === 'lightbox' ? 'true' : null),
        toString: jest.fn(() => 'lightbox=true'),
      });

      render(<SlideView {...defaultProps} />);

      waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden');
      });
    });

    it('restores body scroll when lightbox is closed', () => {
      const { unmount } = render(<SlideView {...defaultProps} />);

      unmount();

      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Edit Functionality', () => {
    it('does not show edit button when canEdit is false', () => {
      render(<SlideView {...defaultProps} />);

      expect(screen.queryByLabelText('Edit slide')).not.toBeInTheDocument();
    });

    it('shows edit button when canEdit is true', () => {
      render(<SlideView {...defaultProps} canEdit={true} />);

      expect(screen.getByLabelText('Edit slide')).toBeInTheDocument();
    });

    it('opens edit form when edit button is clicked', () => {
      render(<SlideView {...defaultProps} canEdit={true} />);

      const editButton = screen.getByLabelText('Edit slide');
      fireEvent.click(editButton);

      expect(screen.getByTestId('slide-edit-form')).toBeInTheDocument();
      expect(screen.getByText('Editing: Test Slide')).toBeInTheDocument();
    });

    it('closes edit form when close is clicked', () => {
      render(<SlideView {...defaultProps} canEdit={true} />);

      const editButton = screen.getByLabelText('Edit slide');
      fireEvent.click(editButton);

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('slide-edit-form')).not.toBeInTheDocument();
    });

    it('updates slide data when save is successful', () => {
      render(<SlideView {...defaultProps} canEdit={true} />);

      const editButton = screen.getByLabelText('Edit slide');
      fireEvent.click(editButton);

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      expect(screen.getByText('Updated Slide')).toBeInTheDocument();
    });

    it('redirects when slide name changes', () => {
      render(<SlideView {...defaultProps} canEdit={true} />);

      const editButton = screen.getByLabelText('Edit slide');
      fireEvent.click(editButton);

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      expect(mockPush).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles slide without description', () => {
      const slideWithoutDescription = {
        ...mockSlide,
        description: undefined,
      };

      render(<SlideView {...defaultProps} slide={slideWithoutDescription} />);

      expect(screen.getByText('Test Slide')).toBeInTheDocument();
    });

    it('handles slide without tags', () => {
      const slideWithoutTags = {
        ...mockSlide,
        tags: [],
      };

      render(<SlideView {...defaultProps} slide={slideWithoutTags} />);

      expect(screen.queryByText('tag1')).not.toBeInTheDocument();
    });

    it('handles slide without visibility', () => {
      const slideWithoutVisibility = {
        ...mockSlide,
        visibility: null,
      };

      render(<SlideView {...defaultProps} slide={slideWithoutVisibility} />);

      expect(screen.getByText('Test Slide')).toBeInTheDocument();
    });

    it('handles slide without metadata', () => {
      const slideWithoutMetadata = {
        ...mockSlide,
        metadata: undefined,
      };

      render(<SlideView {...defaultProps} slide={slideWithoutMetadata} />);

      expect(screen.getByText('Test Slide')).toBeInTheDocument();
      expect(screen.queryByText('Slide Number')).not.toBeInTheDocument();
    });

    it('handles slide without presentation context', () => {
      const slideWithoutPresentation = {
        ...mockSlide,
        metadata: {
          slideNumber: 5,
        },
      };

      render(<SlideView {...defaultProps} slide={slideWithoutPresentation} />);

      expect(screen.queryByText('Presentation Context')).not.toBeInTheDocument();
    });

    it('handles slide without original URL', () => {
      const slideWithoutUrl = {
        ...mockSlide,
        metadata: {
          ...mockSlide.metadata,
          url: undefined,
        },
      };

      render(<SlideView {...defaultProps} slide={slideWithoutUrl} />);

      expect(screen.queryByText('View Original')).not.toBeInTheDocument();
    });

    it('handles slide without file name in metadata', () => {
      const slideWithoutFileName = {
        ...mockSlide,
        metadata: {
          ...mockSlide.metadata,
          presentationFileName: undefined,
        },
      };

      render(<SlideView {...defaultProps} slide={slideWithoutFileName} />);

      expect(screen.getByText('Presentation Title')).toBeInTheDocument();
      expect(screen.queryByText('File Name')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders breadcrumb with aria-label', () => {
      render(<SlideView {...defaultProps} />);

      const breadcrumb = screen.getByLabelText('Breadcrumb');
      expect(breadcrumb).toBeInTheDocument();
    });

    it('renders home icon with screen reader text', () => {
      render(<SlideView {...defaultProps} />);

      expect(screen.getByText('Home')).toHaveClass('sr-only');
    });

    it('renders image with alt text', () => {
      render(<SlideView {...defaultProps} />);

      const image = screen.getByAltText('Slide content text');
      expect(image).toBeInTheDocument();
    });

    it('uses slide name as alt text fallback', () => {
      const slideWithoutText = {
        ...mockSlide,
        metadata: {
          ...mockSlide.metadata,
          slide_text: undefined,
        },
      };

      render(<SlideView {...defaultProps} slide={slideWithoutText} />);

      const image = screen.getByAltText('Slide image for Test Slide');
      expect(image).toBeInTheDocument();
    });

    it('renders buttons with aria-labels', () => {
      render(<SlideView {...defaultProps} canEdit={true} />);

      expect(screen.getByLabelText('Edit slide')).toBeInTheDocument();
      expect(screen.getByLabelText('Open lightbox')).toBeInTheDocument();
    });
  });

  describe('Visibility Colors', () => {
    it('renders public visibility with green color', () => {
      const { container } = render(<SlideView {...defaultProps} />);

      const badge = screen.getByText('public');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('renders internal visibility with yellow color', () => {
      const slideWithInternal = {
        ...mockSlide,
        visibility: 'internal' as const,
      };

      render(<SlideView {...defaultProps} slide={slideWithInternal} />);

      const badge = screen.getByText('internal');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('renders restricted visibility with red color', () => {
      const slideWithRestricted = {
        ...mockSlide,
        visibility: 'restricted' as const,
      };

      render(<SlideView {...defaultProps} slide={slideWithRestricted} />);

      const badge = screen.getByText('restricted');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800');
    });
  });

  describe('Layout', () => {
    it('renders content in white card', () => {
      const { container } = render(<SlideView {...defaultProps} />);

      const card = container.querySelector('.bg-white.shadow');
      expect(card).toBeInTheDocument();
    });

    it('renders with proper container padding', () => {
      const { container } = render(<SlideView {...defaultProps} />);

      const mainContainer = container.querySelector('.mx-auto.max-w-7xl');
      expect(mainContainer).toBeInTheDocument();
    });
  });
});
