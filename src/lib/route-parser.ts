/**
 * Route Parser for Organization Pages
 *
 * Provides type-safe route parsing for the dynamic organization page routes.
 * Handles classification of routes into different types (folders, slides, presentations, files, etc.)
 */

export enum RouteType {
  OrganizationRoot = 'organization_root',
  Folder = 'folder',
  Slide = 'slide',
  Presentation = 'presentation',
  EditSlide = 'edit_slide',
  EditPresentation = 'edit_presentation',
  EditFile = 'edit_file',
  File = 'file',
}

export interface ParsedRoute {
  type: RouteType
  folderPath: string
  resourceName?: string
  fileExtension?: string
}

/**
 * File extensions that trigger file route handling
 */
const FILE_EXTENSIONS = ['.docx', '.xlsx', '.wopitest', '.wopitestx']

/**
 * Clean a URL segment by removing query params, hash, and trailing slashes
 */
function cleanSegment(segment: string): string {
  return segment?.split(/[?#]/, 1)[0]?.replace(/\/+$/, '').toLowerCase() || ''
}

/**
 * Check if a segment is a file route
 */
function isFileSegment(segment: string): boolean {
  const cleaned = cleanSegment(segment)
  return FILE_EXTENSIONS.some((ext) => cleaned.endsWith(ext))
}

/**
 * Parse organization route from slug array
 *
 * @param slug - Array of path segments from Next.js dynamic route
 * @returns Parsed route object with type and relevant path information
 *
 * @example
 * parseOrganizationRoute([]) // { type: RouteType.OrganizationRoot, folderPath: '' }
 * parseOrganizationRoute(['project1', 'folder1']) // { type: RouteType.Folder, folderPath: 'project1/folder1' }
 * parseOrganizationRoute(['project1', 'slide1.slide']) // { type: RouteType.Slide, folderPath: 'project1', resourceName: 'slide1' }
 * parseOrganizationRoute(['project1', 'slide1.slide', 'edit']) // { type: RouteType.EditSlide, folderPath: 'project1', resourceName: 'slide1.slide' }
 */
export function parseOrganizationRoute(
  slug: string[] | undefined,
): ParsedRoute {
  // No slug means organization root
  if (!slug || slug.length === 0) {
    return {
      type: RouteType.OrganizationRoot,
      folderPath: '',
    }
  }

  const lastSegment = slug[slug.length - 1]

  // Check for edit routes (last segment is 'edit')
  if (lastSegment === 'edit') {
    if (slug.length < 2) {
      // Shouldn't happen, but handle gracefully
      return {
        type: RouteType.Folder,
        folderPath: slug.join('/'),
      }
    }

    const resourceName = slug[slug.length - 2]
    const folderPath = slug.slice(0, -2).join('/')

    if (resourceName.endsWith('.slide')) {
      return {
        type: RouteType.EditSlide,
        folderPath,
        resourceName,
      }
    }

    if (resourceName.endsWith('.presentation')) {
      return {
        type: RouteType.EditPresentation,
        folderPath,
        resourceName,
      }
    }

    // File edit route
    return {
      type: RouteType.EditFile,
      folderPath,
      resourceName,
    }
  }

  // Check for file routes
  if (isFileSegment(lastSegment)) {
    const folderPath = slug.slice(0, -1).join('/')
    const cleaned = cleanSegment(lastSegment)
    const dotIndex = cleaned.indexOf('.')
    const extension = dotIndex !== -1 ? cleaned.substring(dotIndex) : ''

    return {
      type: RouteType.File,
      folderPath,
      resourceName: lastSegment,
      fileExtension: extension,
    }
  }

  // Check for slide routes
  if (lastSegment.endsWith('.slide')) {
    const slideName = lastSegment.replace('.slide', '')
    const folderPath = slug.slice(0, -1).join('/')

    return {
      type: RouteType.Slide,
      folderPath,
      resourceName: slideName,
    }
  }

  // Check for presentation routes
  if (lastSegment.endsWith('.presentation')) {
    const presentationName = lastSegment.replace('.presentation', '')
    const folderPath = slug.slice(0, -1).join('/')

    return {
      type: RouteType.Presentation,
      folderPath,
      resourceName: presentationName,
    }
  }

  // Default to folder route
  return {
    type: RouteType.Folder,
    folderPath: slug.join('/'),
  }
}
