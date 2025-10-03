import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SlideGallery from '@/components/SlideGallery';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock next/navigation
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe('SlideGallery', () => {
  const mockSlides = [
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
    {
      order: 3,
      slide_id: 'slide-3',
      object_id: 'object-3',
      imageUrl: 'https://example.com/slide-3.jpg',
    },
  ];

  const defaultProps = {
    slides: mockSlides,
    organizationName: 'test-org',
    folderPath: 'project1/folder1',
    presentationName: 'Test Presentation',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(),
      toString: jest.fn(() => ''),
    });
  });

  describe('Rendering', () => {
    it('renders slide grid', () => {
      render(<SlideGallery {...defaultProps} />);

      expect(screen.getByAltText('Slide 1')).toBeInTheDocument();
      expect(screen.getByAltText('Slide 2')).toBeInTheDocument();
      expect(screen.getByAltText('Slide 3')).toBeInTheDocument();
    });

    it('renders empty state when no slides', () => {
      render(<SlideGallery {...defaultProps} slides={[]} />);

      expect(screen.getByText('No slides')).toBeInTheDocument();
      expect(
        screen.getByText("This presentation doesn't have any slides yet.")
      ).toBeInTheDocument();
    });

    it('renders empty state when slides is null', () => {
      render(<SlideGallery {...defaultProps} slides={null as any} />);

      expect(screen.getByText('No slides')).toBeInTheDocument();
    });

    it('displays slide number badge', () => {
      render(<SlideGallery {...defaultProps} />);

      // Badges should show slide order/number
      const badges = screen.getAllByText(/^[123]$/);
      expect(badges.length).toBeGreaterThanOrEqual(3);
    });

    it('displays slide images with correct src', () => {
      render(<SlideGallery {...defaultProps} />);

      const image1 = screen.getByAltText('Slide 1') as HTMLImageElement;
      const image2 = screen.getByAltText('Slide 2') as HTMLImageElement;

      expect(image1.src).toContain('slide-1.jpg');
      expect(image2.src).toContain('slide-2.jpg');
    });

    it('applies lazy loading to images', () => {
      render(<SlideGallery {...defaultProps} />);

      const images = screen.getAllByRole('img');
      images.forEach((img) => {
        expect(img).toHaveAttribute('loading', 'lazy');
      });
    });
  });

  describe('Lightbox Functionality', () => {
    it('opens lightbox when slide is clicked', () => {
      render(<SlideGallery {...defaultProps} />);

      const firstSlide = screen.getByAltText('Slide 1').closest('div');
      if (firstSlide) {
        fireEvent.click(firstSlide);
      }

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('slide=1'),
        expect.objectContaining({ scroll: false })
      );
    });

    it('displays lightbox with correct slide', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => (param === 'slide' ? '2' : null),
        toString: jest.fn(() => 'slide=2'),
      });

      render(<SlideGallery {...defaultProps} />);

      // Lightbox should show slide 2 of 3
      expect(screen.getByText(/Slide 2 of 3/)).toBeInTheDocument();
    });

    it('closes lightbox when close button is clicked', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => (param === 'slide' ? '1' : null),
        toString: jest.fn(() => 'slide=1'),
      });

      render(<SlideGallery {...defaultProps} />);

      const closeButton = screen.getByLabelText('Close lightbox');
      fireEvent.click(closeButton);

      expect(mockPush).toHaveBeenCalled();
    });

    it('navigates to next slide when next button is clicked', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => (param === 'slide' ? '1' : null),
        toString: jest.fn(() => 'slide=1'),
      });

      render(<SlideGallery {...defaultProps} />);

      const nextButton = screen.getByLabelText('Next slide');
      fireEvent.click(nextButton);

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('slide=2'),
        expect.objectContaining({ scroll: false })
      );
    });

    it('navigates to previous slide when previous button is clicked', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => (param === 'slide' ? '2' : null),
        toString: jest.fn(() => 'slide=2'),
      });

      render(<SlideGallery {...defaultProps} />);

      const prevButton = screen.getByLabelText('Previous slide');
      fireEvent.click(prevButton);

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('slide=1'),
        expect.objectContaining({ scroll: false })
      );
    });

    it('wraps to last slide when going previous from first slide', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => (param === 'slide' ? '1' : null),
        toString: jest.fn(() => 'slide=1'),
      });

      render(<SlideGallery {...defaultProps} />);

      const prevButton = screen.getByLabelText('Previous slide');
      fireEvent.click(prevButton);

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('slide=3'),
        expect.objectContaining({ scroll: false })
      );
    });

    it('wraps to first slide when going next from last slide', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => (param === 'slide' ? '3' : null),
        toString: jest.fn(() => 'slide=3'),
      });

      render(<SlideGallery {...defaultProps} />);

      const nextButton = screen.getByLabelText('Next slide');
      fireEvent.click(nextButton);

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('slide=1'),
        expect.objectContaining({ scroll: false })
      );
    });
  });

  describe('Keyboard Navigation', () => {
    it('closes lightbox on Escape key', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => (param === 'slide' ? '1' : null),
        toString: jest.fn(() => 'slide=1'),
      });

      render(<SlideGallery {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockPush).toHaveBeenCalled();
    });

    it('navigates to next slide on ArrowRight key', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => (param === 'slide' ? '1' : null),
        toString: jest.fn(() => 'slide=1'),
      });

      render(<SlideGallery {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'ArrowRight' });

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('slide=2'),
        expect.objectContaining({ scroll: false })
      );
    });

    it('navigates to previous slide on ArrowLeft key', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => (param === 'slide' ? '2' : null),
        toString: jest.fn(() => 'slide=2'),
      });

      render(<SlideGallery {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'ArrowLeft' });

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('slide=1'),
        expect.objectContaining({ scroll: false })
      );
    });

    it('does not handle keyboard events when lightbox is closed', () => {
      render(<SlideGallery {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'ArrowRight' });

      // Should not navigate when lightbox is not open
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Navigation Dots', () => {
    it('renders navigation dots for each slide', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => (param === 'slide' ? '1' : null),
        toString: jest.fn(() => 'slide=1'),
      });

      render(<SlideGallery {...defaultProps} />);

      const dots = screen.getAllByLabelText(/Go to slide/);
      expect(dots).toHaveLength(3);
    });

    it('navigates to specific slide when dot is clicked', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => (param === 'slide' ? '1' : null),
        toString: jest.fn(() => 'slide=1'),
      });

      render(<SlideGallery {...defaultProps} />);

      const thirdDot = screen.getByLabelText('Go to slide 3');
      fireEvent.click(thirdDot);

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('slide=3'),
        expect.objectContaining({ scroll: false })
      );
    });
  });

  describe('Slide Ordering', () => {
    it('sorts slides by order property', () => {
      const unorderedSlides = [
        { order: 3, slide_id: 'slide-3', object_id: 'obj-3', imageUrl: 'url3' },
        { order: 1, slide_id: 'slide-1', object_id: 'obj-1', imageUrl: 'url1' },
        { order: 2, slide_id: 'slide-2', object_id: 'obj-2', imageUrl: 'url2' },
      ];

      render(<SlideGallery {...defaultProps} slides={unorderedSlides} />);

      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('alt', 'Slide 1');
      expect(images[1]).toHaveAttribute('alt', 'Slide 2');
      expect(images[2]).toHaveAttribute('alt', 'Slide 3');
    });
  });

  describe('URL Parameter Handling', () => {
    it('opens lightbox on mount when URL has slide parameter', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => (param === 'slide' ? '2' : null),
        toString: jest.fn(() => 'slide=2'),
      });

      render(<SlideGallery {...defaultProps} />);

      expect(screen.getByText(/Slide 2 of 3/)).toBeInTheDocument();
    });

    it('ignores invalid slide parameter', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => (param === 'slide' ? 'invalid' : null),
        toString: jest.fn(() => 'slide=invalid'),
      });

      render(<SlideGallery {...defaultProps} />);

      // Lightbox should not open with invalid parameter
      expect(screen.queryByText(/Slide/)).not.toBeInTheDocument();
    });

    it('ignores out-of-range slide parameter', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => (param === 'slide' ? '10' : null),
        toString: jest.fn(() => 'slide=10'),
      });

      render(<SlideGallery {...defaultProps} />);

      // Lightbox should not open with out-of-range parameter
      expect(screen.queryByLabelText('Close lightbox')).not.toBeInTheDocument();
    });
  });

  describe('Hover Effects', () => {
    it('shows hover overlay icon on slide card', () => {
      render(<SlideGallery {...defaultProps} />);

      // Hover icon should be present in the DOM
      const svgElements = screen.getAllByRole('img', { hidden: true });
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('renders images with alt text', () => {
      render(<SlideGallery {...defaultProps} />);

      expect(screen.getByAltText('Slide 1')).toBeInTheDocument();
      expect(screen.getByAltText('Slide 2')).toBeInTheDocument();
      expect(screen.getByAltText('Slide 3')).toBeInTheDocument();
    });

    it('renders lightbox buttons with aria-labels', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => (param === 'slide' ? '1' : null),
        toString: jest.fn(() => 'slide=1'),
      });

      render(<SlideGallery {...defaultProps} />);

      expect(screen.getByLabelText('Close lightbox')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous slide')).toBeInTheDocument();
      expect(screen.getByLabelText('Next slide')).toBeInTheDocument();
    });

    it('renders navigation dots with aria-labels', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => (param === 'slide' ? '1' : null),
        toString: jest.fn(() => 'slide=1'),
      });

      render(<SlideGallery {...defaultProps} />);

      expect(screen.getByLabelText('Go to slide 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to slide 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to slide 3')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles single slide', () => {
      const singleSlide = [mockSlides[0]];

      render(<SlideGallery {...defaultProps} slides={singleSlide} />);

      expect(screen.getByAltText('Slide 1')).toBeInTheDocument();
    });

    it('handles many slides', () => {
      const manySlides = Array.from({ length: 50 }, (_, i) => ({
        order: i + 1,
        slide_id: `slide-${i + 1}`,
        object_id: `obj-${i + 1}`,
        imageUrl: `url-${i + 1}`,
      }));

      render(<SlideGallery {...defaultProps} slides={manySlides} />);

      const images = screen.getAllByRole('img');
      expect(images.length).toBe(50);
    });

    it('handles slides with zero order', () => {
      const slidesWithZero = [
        { order: 0, slide_id: 'slide-0', object_id: 'obj-0', imageUrl: 'url0' },
        { order: 1, slide_id: 'slide-1', object_id: 'obj-1', imageUrl: 'url1' },
      ];

      render(<SlideGallery {...defaultProps} slides={slidesWithZero} />);

      expect(screen.getByAltText('Slide 0')).toBeInTheDocument();
      expect(screen.getByAltText('Slide 1')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('renders in grid layout', () => {
      const { container } = render(<SlideGallery {...defaultProps} />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('applies responsive grid columns', () => {
      const { container } = render(<SlideGallery {...defaultProps} />);

      const grid = container.querySelector('.grid-cols-1');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Lightbox Display', () => {
    it('shows current slide number in lightbox', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => (param === 'slide' ? '2' : null),
        toString: jest.fn(() => 'slide=2'),
      });

      render(<SlideGallery {...defaultProps} />);

      expect(screen.getByText('Slide 2 of 3')).toBeInTheDocument();
    });

    it('displays correct image in lightbox', () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => (param === 'slide' ? '2' : null),
        toString: jest.fn(() => 'slide=2'),
      });

      render(<SlideGallery {...defaultProps} />);

      const lightboxImages = screen.getAllByAltText('Slide 2') as HTMLImageElement[];
      const lightboxImage = lightboxImages.find(img => img.className.includes('max-h-full'));
      expect(lightboxImage?.src).toContain('slide-2.jpg');
    });
  });
});
