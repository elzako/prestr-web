import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '../../../../types/database.types'
import OrgHeader from '@/components/OrgHeader'
import FolderContentList from '@/components/FolderContentList'
import PresentationViewClient from '@/components/PresentationViewClient'
import SlideViewClient from '@/components/SlideViewClient'
import FolderViewClient from '@/components/FolderViewClient'

// Disable caching for data freshness
export const revalidate = 0

type Organization = Pick<
  Tables<'organizations'>,
  'id' | 'organization_name' | 'metadata' | 'tags'
>

type Folder = Pick<
  Tables<'folders'>,
  'id' | 'folder_name' | 'full_path' | 'tags' | 'visibility'
>

type Presentation = Pick<
  Tables<'presentations'>,
  'id' | 'presentation_name' | 'metadata' | 'created_at'
>

type Slide = Pick<
  Tables<'slides'>,
  'id' | 'slide_name' | 'metadata' | 'created_at'
>

type SlideDetail = Pick<
  Tables<'slides'>,
  | 'id'
  | 'slide_name'
  | 'metadata'
  | 'created_at'
  | 'updated_at'
  | 'object_id'
  | 'tags'
  | 'visibility'
>

type PresentationDetail = Pick<
  Tables<'presentations'>,
  | 'id'
  | 'presentation_name'
  | 'metadata'
  | 'created_at'
  | 'updated_at'
  | 'tags'
  | 'slides'
  | 'settings'
  | 'locked'
  | 'version'
>

interface PageProps {
  params: Promise<{
    organization: string
    slug: string[]
  }>
}

interface FolderContent {
  folders: Folder[]
  presentations: Presentation[]
  slides: Slide[]
}

async function getOrganization(
  organizationName: string,
): Promise<Organization | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organizations')
    .select('id, organization_name, metadata, tags')
    .eq('organization_name', organizationName)
    .maybeSingle()

  if (error) {
    console.error('Error fetching organization:', error)
    return null
  }

  return data
}

async function getFolderId(
  organizationId: string,
  folderPath: string,
): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_folder_id_by_full_path', {
    org_id: organizationId,
    current_path: '/' + folderPath,
  })

  if (error) {
    console.error('Error fetching folder ID:', error)
    return null
  }

  return data
}

async function getFolderContent(folderId: string): Promise<FolderContent> {
  const supabase = await createClient()

  // Fetch sub-folders
  const { data: folders, error: foldersError } = await supabase
    .from('folders')
    .select('id, folder_name, full_path, tags, visibility')
    .eq('parent_id', folderId)
    .order('folder_name', { ascending: true })

  // Fetch presentations
  const { data: presentations, error: presentationsError } = await supabase
    .from('presentations')
    .select('id, presentation_name, metadata, created_at')
    .eq('parent_id', folderId)
    .order('presentation_name', { ascending: true })

  // Fetch slides
  const { data: slides, error: slidesError } = await supabase
    .from('slides')
    .select('id, slide_name, metadata, created_at')
    .eq('parent_id', folderId)
    .order('slide_name', { ascending: true })

  if (foldersError) {
    console.error('Error fetching folders:', foldersError)
  }

  if (presentationsError) {
    console.error('Error fetching presentations:', presentationsError)
  }

  if (slidesError) {
    console.error('Error fetching slides:', slidesError)
  }

  return {
    folders: folders || [],
    presentations: presentations || [],
    slides: slides || [],
  }
}

async function getSlideData(
  parentId: string,
  slideName: string,
): Promise<SlideDetail | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('slides')
    .select(
      'id, slide_name, metadata, created_at, updated_at, object_id, tags, visibility',
    )
    .eq('parent_id', parentId)
    .eq('slide_name', slideName)
    .maybeSingle()

  if (error) {
    console.error('Error fetching slide:', error)
    return null
  }

  return data
}

async function getPresentationData(
  parentId: string,
  presentationName: string,
): Promise<PresentationDetail | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('presentations')
    .select(
      'id, presentation_name, metadata, created_at, updated_at, tags, slides, settings, locked, version',
    )
    .eq('parent_id', parentId)
    .eq('presentation_name', presentationName)
    .maybeSingle()

  if (error) {
    console.error('Error fetching presentation:', error)
    return null
  }

  return data
}

// Component for displaying individual slide
function SlideView({
  slide,
  organization,
  folderPath,
}: {
  slide: SlideDetail
  organization: Organization
  folderPath: string
}) {
  return (
    <>
      <OrgHeader organization={organization} />
      <SlideViewClient
        slide={slide}
        organization={organization}
        folderPath={folderPath}
      />
    </>
  )
}

// Component for displaying individual presentation
function PresentationView({
  presentation,
  organization,
  folderPath,
}: {
  presentation: PresentationDetail
  organization: Organization
  folderPath: string
}) {
  return (
    <>
      <OrgHeader organization={organization} />
      <PresentationViewClient
        presentation={presentation}
        organization={organization}
        folderPath={folderPath}
      />
    </>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { organization: organizationName, slug } = await params
  const organization = await getOrganization(organizationName)

  if (!organization) {
    return {
      title: 'Organization Not Found',
    }
  }

  const metadata = organization.metadata as {
    name?: string
    about?: string
    website?: string
    location?: string
    profilePicture?: string
    displayMembers?: boolean
  } | null

  const displayName = metadata?.name || organization.organization_name

  // Check if this is a slide or presentation route
  const lastSegment = slug[slug.length - 1]
  const isSlideRoute = lastSegment?.endsWith('.slide')
  const isPresentationRoute = lastSegment?.endsWith('.presentation')

  if (isSlideRoute) {
    const slideName = lastSegment.replace('.slide', '')
    const folderPath = slug.slice(0, -1).join('/')
    return {
      title: `${slideName} - ${folderPath} - ${displayName}`,
      description: `Slide: ${slideName} in ${folderPath}`,
    }
  }

  if (isPresentationRoute) {
    const presentationName = lastSegment.replace('.presentation', '')
    const folderPath = slug.slice(0, -1).join('/')
    return {
      title: `${presentationName} - ${folderPath} - ${displayName}`,
      description: `Presentation: ${presentationName} in ${folderPath}`,
    }
  }

  const folderName = slug.join('/')
  return {
    title: `${folderName} - ${displayName}`,
    description: `Contents of ${folderName} in ${displayName}`,
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { organization: organizationName, slug } = await params

  // Step 1: Get organization
  const organization = await getOrganization(organizationName)
  if (!organization) {
    notFound()
  }

  // Check if this is a slide or presentation route
  const lastSegment = slug[slug.length - 1]
  const isSlideRoute = lastSegment?.endsWith('.slide')
  const isPresentationRoute = lastSegment?.endsWith('.presentation')

  if (isSlideRoute) {
    // Handle slide view
    const slideName = lastSegment.replace('.slide', '')
    const folderPath = slug.slice(0, -1).join('/')

    // Step 2: Get folder ID using the full path
    const folderId = await getFolderId(organization.id, folderPath)
    if (!folderId) {
      notFound()
    }

    // Step 3: Get slide data
    const slide = await getSlideData(folderId, slideName)
    if (!slide) {
      notFound()
    }

    return (
      <SlideView
        slide={slide}
        organization={organization}
        folderPath={folderPath}
      />
    )
  } else if (isPresentationRoute) {
    // Handle presentation view
    const presentationName = lastSegment.replace('.presentation', '')
    const folderPath = slug.slice(0, -1).join('/')

    // Step 2: Get folder ID using the full path
    const folderId = await getFolderId(organization.id, folderPath)
    if (!folderId) {
      notFound()
    }

    // Step 3: Get presentation data
    const presentation = await getPresentationData(folderId, presentationName)
    if (!presentation) {
      notFound()
    }

    return (
      <PresentationView
        presentation={presentation}
        organization={organization}
        folderPath={folderPath}
      />
    )
  } else {
    // Handle folder view
    const folderPath = slug.join('/')

    // Step 2: Get folder ID using the full path
    const folderId = await getFolderId(organization.id, folderPath)
    if (!folderId) {
      notFound()
    }

    // Step 3: Get folder content
    const content = await getFolderContent(folderId)

    return (
      <>
        <OrgHeader organization={organization} />
        <FolderViewClient
          organization={organization}
          folderId={folderId}
          folderPath={folderPath}
          content={content}
        />
      </>
    )
  }
}
