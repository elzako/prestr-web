import { getSlideImageUrl } from '@/lib/cloudinary'
import type { PresentationViewProps } from '@/types'
import PresentationViewClient from './PresentationViewClient'

export default async function PresentationView({
  presentation,
  organization,
  folderPath,
  canEdit = false,
}: PresentationViewProps) {
  const slides = presentation.slides as
    | {
        order: number
        slide_id: string
        object_id: string
        url?: string
      }[]
    | null

  // Prepare slide data with image URLs for client component
  const slideData =
    slides?.map((slide) => ({
      order: slide.order,
      slide_id: slide.slide_id,
      object_id: slide.object_id,
      imageUrl: getSlideImageUrl(
        organization.id,
        slide.slide_id,
        slide.object_id,
      ),
    })) || []

  return (
    <PresentationViewClient
      presentation={presentation}
      organization={organization}
      folderPath={folderPath}
      canEdit={canEdit}
      slideData={slideData}
    />
  )
}
