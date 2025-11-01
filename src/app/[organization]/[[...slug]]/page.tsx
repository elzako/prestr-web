import CompactOrgHeader from '@/components/CompactOrgHeader'
import FolderView from '@/components/FolderView'
import OrgHeader from '@/components/OrgHeader'
import PresentationView from '@/components/PresentationView'
import ProjectList from '@/components/ProjectList'
import SlideView from '@/components/SlideView'
import MicrosoftFileEditor from '@/components/MicrosoftFileEditor'
import { getUserOrganizationRole } from '@/lib/organization-server-actions'
import { parseOrganizationRoute, RouteType } from '@/lib/route-parser'
import {
  getOrganization,
  getTopLevelProjects,
} from '@/lib/services/organization-service'
import {
  getFolderId,
  getRootFolderId,
  getSubFolderIds,
  getFolderContent,
} from '@/lib/services/folder-service'
import {
  getSlideData,
  getSlideInfo,
  getSlideImageUrl,
} from '@/lib/services/slide-service'
import {
  getPresentationData,
  getPresentationInfo,
} from '@/lib/services/presentation-service'
import { getFileInfo } from '@/lib/services/file-service'
import {
  getCurrentUserRoles,
  checkEditPermissions,
} from '@/lib/services/user-service'
import { getWopiToken } from '@/lib/services/wopi-service'
import { notFound } from 'next/navigation'

export const revalidate = 3600

interface PageProps {
  params: Promise<{
    organization: string
    slug?: string[]
  }>
}

export default async function OrganizationPage({ params }: PageProps) {
  const { organization: organizationName, slug } = await params

  // Parse the route to determine what type of page to render
  const route = parseOrganizationRoute(slug)

  // Fetch organization and user roles (needed for all routes)
  const [organization, userRoles] = await Promise.all([
    getOrganization(organizationName),
    getCurrentUserRoles(),
  ])

  if (!organization) {
    notFound()
  }

  // Get user's role in this specific organization
  const userOrgRoleResult = await getUserOrganizationRole(organization.id)
  const userOrganizationRole = userOrgRoleResult.success
    ? userOrgRoleResult.role
    : null

  // Handle different route types
  switch (route.type) {
    case RouteType.OrganizationRoot:
      return renderOrganizationRoot(
        organization,
        organizationName,
        userOrganizationRole,
        userRoles,
      )

    case RouteType.File:
      return renderFile(organization, route)

    case RouteType.EditSlide:
      return renderEditSlide(organization, route)

    case RouteType.EditPresentation:
      return renderEditPresentation(organization, route)

    case RouteType.EditFile:
      return renderEditFile(organization, route)

    case RouteType.Slide:
      return renderSlide(organization, route, userOrganizationRole)

    case RouteType.Presentation:
      return renderPresentation(
        organization,
        route,
        userOrganizationRole,
        userRoles,
      )

    case RouteType.Folder:
      return renderFolder(organization, route, userOrganizationRole, userRoles)

    default:
      notFound()
  }
}

/**
 * Render organization root with top-level projects
 */
async function renderOrganizationRoot(
  organization: any,
  organizationName: string,
  userOrganizationRole: string | null,
  userRoles: any,
) {
  const projects = await getTopLevelProjects(organization.id)

  return (
    <div className="bg-gray-50">
      <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <OrgHeader
          organization={organization}
          userRole={userOrganizationRole}
        />

        <div className="mt-8">
          <ProjectList
            projects={projects}
            organizationName={organizationName}
            organizationId={organization.id}
            userRoles={userRoles}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Render file editor (Microsoft Office files)
 */
async function renderFile(organization: any, route: any) {
  const folderId = await getFolderId(organization.id, route.folderPath)
  if (!folderId) {
    notFound()
  }

  const fileId = await getFileInfo(
    organization.id,
    folderId,
    route.resourceName,
  )
  if (!fileId) {
    notFound()
  }

  const wopiToken = await getWopiToken(fileId, true, 'file')
  if (!wopiToken) {
    notFound()
  }

  return (
    <MicrosoftFileEditor
      wopiUrl={wopiToken.wopiUrl}
      accessToken={wopiToken.accessToken}
      accessTokenTtl={wopiToken.accessTokenTtl}
    />
  )
}

/**
 * Render slide editor
 */
async function renderEditSlide(organization: any, route: any) {
  const folderId = await getFolderId(organization.id, route.folderPath)
  if (!folderId) {
    notFound()
  }

  const fileId = await getSlideInfo(
    organization.id,
    folderId,
    route.resourceName,
  )
  if (!fileId) {
    notFound()
  }

  const wopiToken = await getWopiToken(fileId, true, 'slide')
  if (!wopiToken) {
    notFound()
  }

  return (
    <MicrosoftFileEditor
      wopiUrl={wopiToken.wopiUrl}
      accessToken={wopiToken.accessToken}
      accessTokenTtl={wopiToken.accessTokenTtl}
    />
  )
}

/**
 * Render presentation editor
 */
async function renderEditPresentation(organization: any, route: any) {
  const folderId = await getFolderId(organization.id, route.folderPath)
  if (!folderId) {
    notFound()
  }

  const fileId = await getPresentationInfo(
    organization.id,
    folderId,
    route.resourceName,
  )
  if (!fileId) {
    notFound()
  }

  const wopiToken = await getWopiToken(fileId, true, 'presentation')
  if (!wopiToken) {
    notFound()
  }

  return (
    <MicrosoftFileEditor
      wopiUrl={wopiToken.wopiUrl}
      accessToken={wopiToken.accessToken}
      accessTokenTtl={wopiToken.accessTokenTtl}
    />
  )
}

/**
 * Render file editor (generic)
 */
async function renderEditFile(organization: any, route: any) {
  const folderId = await getFolderId(organization.id, route.folderPath)
  if (!folderId) {
    notFound()
  }

  const fileId = await getFileInfo(
    organization.id,
    folderId,
    route.resourceName,
  )
  if (!fileId) {
    notFound()
  }

  const wopiToken = await getWopiToken(fileId, true, 'file')
  if (!wopiToken) {
    notFound()
  }

  return (
    <MicrosoftFileEditor
      wopiUrl={wopiToken.wopiUrl}
      accessToken={wopiToken.accessToken}
      accessTokenTtl={wopiToken.accessTokenTtl}
    />
  )
}

/**
 * Render slide view
 */
async function renderSlide(
  organization: any,
  route: any,
  userOrganizationRole: string | null,
) {
  const folderId = await getFolderId(organization.id, route.folderPath)
  if (!folderId) {
    notFound()
  }

  const slide = await getSlideData(folderId, route.resourceName)
  if (!slide) {
    notFound()
  }

  const canEdit = await checkEditPermissions(slide.parent_id)

  // Generate image URLs
  const imageUrl = await getSlideImageUrl(
    organization.id,
    String(slide.id),
    slide.object_id,
  )

  const draftImageUrl = slide.draft_object_id
    ? await getSlideImageUrl(
        organization.id,
        String(slide.id),
        slide.draft_object_id,
      )
    : null

  return (
    <div className="bg-gray-50">
      <div className="min-h-screen">
        <CompactOrgHeader
          organization={organization}
          userRole={userOrganizationRole}
        />
        <SlideView
          slide={slide}
          organization={organization}
          folderPath={route.folderPath}
          imageUrl={imageUrl}
          draftImageUrl={draftImageUrl}
          canEdit={canEdit}
        />
      </div>
    </div>
  )
}

/**
 * Render presentation view
 */
async function renderPresentation(
  organization: any,
  route: any,
  userOrganizationRole: string | null,
  userRoles: any,
) {
  const folderId = await getFolderId(organization.id, route.folderPath)
  if (!folderId) {
    notFound()
  }

  const presentation = await getPresentationData(folderId, route.resourceName)
  if (!presentation) {
    notFound()
  }

  const projectId = await getRootFolderId(presentation.parent_id)
  const canEdit = await checkEditPermissions(presentation.parent_id)

  return (
    <div className="bg-gray-50">
      <div className="min-h-screen">
        <CompactOrgHeader
          organization={organization}
          userRole={userOrganizationRole}
        />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <PresentationView
            presentation={presentation}
            organization={organization}
            folderPath={route.folderPath}
            canEdit={canEdit}
            projectId={projectId || undefined}
            userRoles={userRoles}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Render folder view
 */
async function renderFolder(
  organization: any,
  route: any,
  userOrganizationRole: string | null,
  userRoles: any,
) {
  const folderId = await getFolderId(organization.id, route.folderPath)
  if (!folderId) {
    notFound()
  }

  const [folderContent, projectId, subFolderIds] = await Promise.all([
    getFolderContent(folderId),
    getRootFolderId(folderId),
    // Only get sub folder IDs if not a top-level project (slug length > 1)
    route.folderPath.split('/').length === 1
      ? Promise.resolve([])
      : getSubFolderIds(folderId),
  ])

  return (
    <div className="bg-gray-50">
      <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <OrgHeader
          organization={organization}
          userRole={userOrganizationRole}
        />
        <FolderView
          organization={organization}
          folderId={folderId}
          folderPath={route.folderPath}
          content={folderContent}
          projectId={projectId}
          subFolderIds={subFolderIds}
          userRoles={userRoles}
        />
      </div>
    </div>
  )
}

/* export async function generateMetadata({ params }: PageProps) {
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

  if (!slug || slug.length === 0) {
    return {
      title: `${displayName} - Projects`,
      description: metadata?.about || `Explore projects from ${displayName}`,
    }
  }

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

  const currentPath = slug.join('/')
  return {
    title: `${currentPath} - ${displayName}`,
    description: `Browse ${currentPath} in ${displayName}`,
  }
} */
