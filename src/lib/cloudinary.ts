import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary using server-side environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_CLOUDINARY_API_SECRET,
  secure: true,
})

/**
 * Generate a Cloudinary image URL for a slide.
 * The public ID follows: organization_id/slide_id/object_id
 */
export function getSlideImageUrl(
  organizationId: string,
  slideId: string,
  objectId: string,
): string {
  const publicId = `${organizationId}/${slideId}/${objectId}.png`

  // Let Cloudinary handle delivery; skip Next/Image optimization by using <img>
  return cloudinary.url(publicId, {
    type: 'authenticated',
    sign_url: true,
    quality: 'auto',
    fetch_format: 'auto',
    secure: true,
  })
}
