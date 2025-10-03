import React from 'react';
import { render, screen } from '@testing-library/react';
import PresentationView from '@/components/PresentationView';
import type { Organization, PresentationDetail } from '@/types';
import { getSlideImageUrl } from '@/lib/cloudinary';

// Mock cloudinary
jest.mock('@/lib/cloudinary', () => ({
  getSlideImageUrl: jest.fn(),
}));

// Mock PresentationViewClient component
jest.mock('@/components/PresentationViewClient', () => ({
  __esModule: true,
  default: ({ presentation, organization, folderPath, canEdit, slideData }: any) => (
    <div data-testid="presentation-view-client">
      <div data-testid="presentation-name">{presentation.presentation_name}</div>
      <div data-testid="organization-name">{organization.organization_name}</div>
      <div data-testid="folder-path">{folderPath}</div>
      <div data-testid="can-edit">{canEdit ? 'true' : 'false'}</div>
      <div data-testid="slide-count">{slideData.length}</div>
      {slideData.map((slide: any) => (
        <div key={slide.slide_id} data-testid={`slide-${slide.slide_id}`}>
          <span>{slide.order}</span>
          <span>{slide.imageUrl}</span>
        </div>
      ))}
    </div>
  ),
}));

describe('PresentationView', () => {
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
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    slides: [
      {
        order: 1,
        slide_id: 'slide-1',
        object_id: 'object-1',
      },
      {
        order: 2,
        slide_id: 'slide-2',
        object_id: 'object-2',
      },
    ],
    metadata: undefined,
    tags: [],
    settings: {
      pptxDownloadRole: 'public' as const,
      pdfDownloadRole: 'public' as const,
      chatRole: 'public' as const,
    },
    version: 1,
  };

  const defaultProps = {
    presentation: mockPresentation,
    organization: mockOrganization,
    folderPath: 'project1/folder1',
    canEdit: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getSlideImageUrl as jest.Mock).mockImplementation(
      (orgId, slideId, objectId) => `https://cloudinary.com/${orgId}/${slideId}/${objectId}`
    );
  });

  describe('Rendering', () => {
    it('renders PresentationViewClient with correct props', async () => {
      render(await PresentationView(defaultProps));

      expect(screen.getByTestId('presentation-view-client')).toBeInTheDocument();
      expect(screen.getByTestId('presentation-name')).toHaveTextContent('Test Presentation');
      expect(screen.getByTestId('organization-name')).toHaveTextContent('test-org');
      expect(screen.getByTestId('folder-path')).toHaveTextContent('project1/folder1');
    });

    it('passes canEdit prop correctly', async () => {
      render(await PresentationView({ ...defaultProps, canEdit: true }));

      expect(screen.getByTestId('can-edit')).toHaveTextContent('true');
    });

    it('passes canEdit as false by default', async () => {
      render(await PresentationView(defaultProps));

      expect(screen.getByTestId('can-edit')).toHaveTextContent('false');
    });
  });

  describe('Slide Data Processing', () => {
    it('processes slide data correctly', async () => {
      render(await PresentationView(defaultProps));

      expect(screen.getByTestId('slide-count')).toHaveTextContent('2');
      expect(screen.getByTestId('slide-slide-1')).toBeInTheDocument();
      expect(screen.getByTestId('slide-slide-2')).toBeInTheDocument();
    });

    it('calls getSlideImageUrl for each slide', async () => {
      render(await PresentationView(defaultProps));

      expect(getSlideImageUrl).toHaveBeenCalledWith('org-123', 'slide-1', 'object-1');
      expect(getSlideImageUrl).toHaveBeenCalledWith('org-123', 'slide-2', 'object-2');
      expect(getSlideImageUrl).toHaveBeenCalledTimes(2);
    });

    it('generates correct image URLs for slides', async () => {
      render(await PresentationView(defaultProps));

      const slide1 = screen.getByTestId('slide-slide-1');
      expect(slide1).toHaveTextContent('https://cloudinary.com/org-123/slide-1/object-1');

      const slide2 = screen.getByTestId('slide-slide-2');
      expect(slide2).toHaveTextContent('https://cloudinary.com/org-123/slide-2/object-2');
    });

    it('preserves slide order', async () => {
      render(await PresentationView(defaultProps));

      const slide1 = screen.getByTestId('slide-slide-1');
      const slide2 = screen.getByTestId('slide-slide-2');

      expect(slide1).toHaveTextContent('1');
      expect(slide2).toHaveTextContent('2');
    });
  });

  describe('Edge Cases', () => {
    it('handles presentation with no slides', async () => {
      const presentationWithoutSlides: PresentationDetail = {
        ...mockPresentation,
        slides: undefined,
      };

      render(
        await PresentationView({
          ...defaultProps,
          presentation: presentationWithoutSlides,
        })
      );

      expect(screen.getByTestId('slide-count')).toHaveTextContent('0');
    });

    it('handles presentation with empty slides array', async () => {
      const presentationWithEmptySlides: PresentationDetail = {
        ...mockPresentation,
        slides: [],
      };

      render(
        await PresentationView({
          ...defaultProps,
          presentation: presentationWithEmptySlides,
        })
      );

      expect(screen.getByTestId('slide-count')).toHaveTextContent('0');
    });

    it('handles slide with url property', async () => {
      const presentationWithUrl: PresentationDetail = {
        ...mockPresentation,
        slides: [
          {
            order: 1,
            slide_id: 'slide-1',
            object_id: 'object-1',
            url: 'https://custom-url.com/slide-1',
          },
        ],
      };

      render(
        await PresentationView({
          ...defaultProps,
          presentation: presentationWithUrl,
        })
      );

      expect(screen.getByTestId('slide-count')).toHaveTextContent('1');
      expect(screen.getByTestId('slide-slide-1')).toBeInTheDocument();
    });

    it('handles multiple slides with different orders', async () => {
      const presentationWithManySlides: PresentationDetail = {
        ...mockPresentation,
        slides: [
          { order: 1, slide_id: 'slide-1', object_id: 'obj-1' },
          { order: 2, slide_id: 'slide-2', object_id: 'obj-2' },
          { order: 3, slide_id: 'slide-3', object_id: 'obj-3' },
          { order: 4, slide_id: 'slide-4', object_id: 'obj-4' },
          { order: 5, slide_id: 'slide-5', object_id: 'obj-5' },
        ],
      };

      render(
        await PresentationView({
          ...defaultProps,
          presentation: presentationWithManySlides,
        })
      );

      expect(screen.getByTestId('slide-count')).toHaveTextContent('5');
      expect(getSlideImageUrl).toHaveBeenCalledTimes(5);
    });
  });

  describe('Props Validation', () => {
    it('passes all required props to client component', async () => {
      render(await PresentationView(defaultProps));

      expect(screen.getByTestId('presentation-view-client')).toBeInTheDocument();
      expect(screen.getByTestId('presentation-name')).toBeInTheDocument();
      expect(screen.getByTestId('organization-name')).toBeInTheDocument();
      expect(screen.getByTestId('folder-path')).toBeInTheDocument();
      expect(screen.getByTestId('can-edit')).toBeInTheDocument();
      expect(screen.getByTestId('slide-count')).toBeInTheDocument();
    });

    it('handles different folder paths', async () => {
      const paths = [
        'project1',
        'project1/folder1',
        'project1/folder1/subfolder',
        'project1/folder1/subfolder/deep',
      ];

      for (const path of paths) {
        const { unmount } = render(
          await PresentationView({ ...defaultProps, folderPath: path })
        );

        expect(screen.getByTestId('folder-path')).toHaveTextContent(path);
        unmount();
      }
    });
  });

  describe('Image URL Generation', () => {
    it('uses organization ID in image URL', async () => {
      render(await PresentationView(defaultProps));

      expect(getSlideImageUrl).toHaveBeenCalledWith(
        'org-123',
        expect.any(String),
        expect.any(String)
      );
    });

    it('uses slide ID in image URL', async () => {
      render(await PresentationView(defaultProps));

      expect(getSlideImageUrl).toHaveBeenCalledWith(
        expect.any(String),
        'slide-1',
        expect.any(String)
      );
      expect(getSlideImageUrl).toHaveBeenCalledWith(
        expect.any(String),
        'slide-2',
        expect.any(String)
      );
    });

    it('uses object ID in image URL', async () => {
      render(await PresentationView(defaultProps));

      expect(getSlideImageUrl).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'object-1'
      );
      expect(getSlideImageUrl).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'object-2'
      );
    });
  });
});
