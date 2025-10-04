import { randomUUID } from 'crypto'
import type {
  FolderContent,
  Organization,
  PresentationDetail,
  Project,
  SlideDetail,
  UserRoles,
  SearchResult,
} from '@/types'

interface TestUser {
  id: string
  email: string
  password: string
  firstName: string
  lastName: string
  position: string
  organizationRoles: { organizationId: string; role: 'owner' | 'admin' | 'member' }[]
  folderRoles: { folderId: string; role: string }[]
}

interface TestUserProfile {
  id: string
  email: string
  deleted_at: string | null
  deleted_by: string | null
  metadata: {
    firstName: string
    lastName: string
    position: string
    organization?: string
    about?: string
    profilePicture?: string | null
  }
}

interface TestSession {
  token: string
  userId: string
  createdAt: number
}

interface TestPasswordResetRequest {
  email: string
  token: string
  requestedAt: number
}

type TestFolder = Project

interface TestPresentation extends PresentationDetail {
  deleted_at: string | null
}

interface TestSlide extends SlideDetail {
  parent_path: string
  organization_id: string
  project_id: string
  searchText: string
  has_chart?: boolean
  has_table?: boolean
  has_diagram?: boolean
  has_image?: boolean
  has_bullet?: boolean
  has_links?: boolean
  has_video?: boolean
  has_audio?: boolean
  deleted_at: string | null
}

interface FolderChildren {
  folders: string[]
  presentations: string[]
  slides: string[]
}

interface TestStore {
  users: Record<string, TestUser>
  userProfiles: Record<string, TestUserProfile>
  organizations: Record<string, Organization>
  folders: Record<string, TestFolder>
  folderChildren: Record<string, FolderChildren>
  presentations: Record<string, TestPresentation>
  slides: Record<string, TestSlide>
  pathToFolderId: Record<string, string>
  sessions: Record<string, TestSession>
  passwordResets: TestPasswordResetRequest[]
}

const GLOBAL_KEY = '__PRESTR_E2E_STORE__'

const BASE_DATE = new Date('2024-01-01T12:00:00.000Z').getTime()

function daysFromBase(days: number) {
  return new Date(BASE_DATE + days * 24 * 60 * 60 * 1000).toISOString()
}
function makeInitialStore(): TestStore {
  const organizationId = 'org-acme'
  const brandProjectId = 'folder-brand'
  const launchFolderId = 'folder-launch'
  const designFolderId = 'folder-design'
  const salesProjectId = 'folder-sales'
  const playbookFolderId = 'folder-playbook'
  const galleryFolderId = 'folder-gallery'

  const users: Record<string, TestUser> = {
    'user-owner': {
      id: 'user-owner',
      email: 'olivia.owner@prestr.test',
      password: 'Password123!',
      firstName: 'Olivia',
      lastName: 'Owner',
      position: 'Head of Marketing',
      organizationRoles: [{ organizationId, role: 'owner' }],
      folderRoles: [
        { folderId: brandProjectId, role: 'admin' },
        { folderId: salesProjectId, role: 'admin' },
      ],
    },
  }

  const userProfiles: Record<string, TestUserProfile> = {
    'user-owner': {
      id: 'user-owner',
      email: 'olivia.owner@prestr.test',
      deleted_at: null,
      deleted_by: null,
      metadata: {
        firstName: 'Olivia',
        lastName: 'Owner',
        position: 'Head of Marketing',
        organization: 'Acme Corporation',
        about:
          'Demo workspace containing curated presentations and slides for end-to-end testing.',
        profilePicture: null,
      },
    },
  }

  const organizations: Record<string, Organization> = {
    [organizationId]: {
      id: organizationId,
      organization_name: 'acme',
      metadata: {
        name: 'Acme Corporation',
        about:
          'Demo workspace containing curated presentations and slides for end-to-end testing.',
        website: 'https://prestr.test',
        location: 'Remote',
        profilePicture: null,
        displayMembers: true,
      },
      tags: ['demo', 'slides', 'enablement'],
    },
  }

  const folders: Record<string, TestFolder> = {
    [brandProjectId]: {
      id: brandProjectId,
      organization_id: organizationId,
      parent_id: null,
      folder_name: 'BrandCampaigns',
      full_path: '/BrandCampaigns',
      tags: ['brand', 'launch'],
      visibility: 'internal',
      metadata: { description: 'Launch playbooks and brand storytelling kits.' },
      created_at: daysFromBase(-30),
      updated_at: daysFromBase(-5),
      deleted_at: null,
    },
    [launchFolderId]: {
      id: launchFolderId,
      organization_id: organizationId,
      parent_id: brandProjectId,
      folder_name: 'ProductLaunch',
      full_path: '/BrandCampaigns/ProductLaunch',
      tags: ['launch', 'product'],
      visibility: 'internal',
      metadata: { description: 'Assets for the Q4 launch sequence.' },
      created_at: daysFromBase(-25),
      updated_at: daysFromBase(-2),
      deleted_at: null,
    },
    [designFolderId]: {
      id: designFolderId,
      organization_id: organizationId,
      parent_id: brandProjectId,
      folder_name: 'DesignReviews',
      full_path: '/BrandCampaigns/DesignReviews',
      tags: ['design', 'reviews'],
      visibility: 'restricted',
      metadata: { description: 'Latest iterations from design critique.' },
      created_at: daysFromBase(-18),
      updated_at: daysFromBase(-1),
      deleted_at: null,
    },
    [salesProjectId]: {
      id: salesProjectId,
      organization_id: organizationId,
      parent_id: null,
      folder_name: 'SalesEnablement',
      full_path: '/SalesEnablement',
      tags: ['sales', 'playbook'],
      visibility: 'internal',
      metadata: { description: 'Sales playbooks and reference decks.' },
      created_at: daysFromBase(-40),
      updated_at: daysFromBase(-7),
      deleted_at: null,
    },
    [playbookFolderId]: {
      id: playbookFolderId,
      organization_id: organizationId,
      parent_id: salesProjectId,
      folder_name: 'Playbooks',
      full_path: '/SalesEnablement/Playbooks',
      tags: ['playbook'],
      visibility: 'internal',
      metadata: { description: 'Step-by-step execution guides.' },
      created_at: daysFromBase(-38),
      updated_at: daysFromBase(-3),
      deleted_at: null,
    },
    [galleryFolderId]: {
      id: galleryFolderId,
      organization_id: organizationId,
      parent_id: salesProjectId,
      folder_name: 'CustomerStories',
      full_path: '/SalesEnablement/CustomerStories',
      tags: ['customers', 'stories'],
      visibility: 'public',
      metadata: { description: 'Customer win slides ready for sharing.' },
      created_at: daysFromBase(-32),
      updated_at: daysFromBase(-4),
      deleted_at: null,
    },
  }
  const folderChildren: Record<string, FolderChildren> = {
    root: {
      folders: [brandProjectId, salesProjectId],
      presentations: [],
      slides: [],
    },
    [brandProjectId]: {
      folders: [launchFolderId, designFolderId],
      presentations: [],
      slides: [],
    },
    [launchFolderId]: {
      folders: [],
      presentations: ['presentation-launch-seq'],
      slides: ['slide-vision', 'slide-roadmap'],
    },
    [designFolderId]: {
      folders: [],
      presentations: ['presentation-design-weekly'],
      slides: ['slide-color-system'],
    },
    [salesProjectId]: {
      folders: [playbookFolderId, galleryFolderId],
      presentations: [],
      slides: [],
    },
    [playbookFolderId]: {
      folders: [],
      presentations: ['presentation-sales-onboarding'],
      slides: ['slide-discovery', 'slide-pricing'],
    },
    [galleryFolderId]: {
      folders: [],
      presentations: [],
      slides: ['slide-customer-story'],
    },
  }
  const presentations: Record<string, TestPresentation> = {
    'presentation-launch-seq': {
      id: 'presentation-launch-seq',
      parent_id: launchFolderId,
      presentation_name: 'LaunchSequence',
      metadata: {
        description: 'Sequenced launch plan with key milestones.',
        thumbnailUrl: '/images/thumbnails/launch-sequence.png',
        slideCount: 12,
      },
      created_at: daysFromBase(-24),
      updated_at: daysFromBase(-2),
      tags: ['launch', 'timeline'],
      slides: [
        { order: 1, slide_id: 'slide-vision', object_id: 'obj-vision' },
        { order: 2, slide_id: 'slide-roadmap', object_id: 'obj-roadmap' },
      ],
      settings: {
        pptxDownloadRole: 'project-admin',
        pdfDownloadRole: 'project-member',
        chatRole: 'project-contributor',
        aspectRatio: '16:9',
      },
      version: 1,
      deleted_at: null,
    },
    'presentation-design-weekly': {
      id: 'presentation-design-weekly',
      parent_id: designFolderId,
      presentation_name: 'DesignReview',
      metadata: {
        description: 'Weekly design review snapshots.',
        slideCount: 8,
      },
      created_at: daysFromBase(-17),
      updated_at: daysFromBase(-1),
      tags: ['design', 'feedback'],
      slides: [{ order: 1, slide_id: 'slide-color-system', object_id: 'obj-color-system' }],
      settings: {
        pptxDownloadRole: 'project-member',
        pdfDownloadRole: 'project-member',
        chatRole: 'project-contributor',
        aspectRatio: '16:9',
      },
      version: 2,
      deleted_at: null,
    },
    'presentation-sales-onboarding': {
      id: 'presentation-sales-onboarding',
      parent_id: playbookFolderId,
      presentation_name: 'SalesOnboarding',
      metadata: {
        description: 'Fast-track onboarding deck for new sellers.',
        slideCount: 15,
      },
      created_at: daysFromBase(-37),
      updated_at: daysFromBase(-3),
      tags: ['sales', 'onboarding'],
      slides: [
        { order: 1, slide_id: 'slide-discovery', object_id: 'obj-discovery' },
        { order: 2, slide_id: 'slide-pricing', object_id: 'obj-pricing' },
      ],
      settings: {
        pptxDownloadRole: 'project-member',
        pdfDownloadRole: 'project-member',
        chatRole: 'project-contributor',
        aspectRatio: '4:3',
      },
      version: 3,
      deleted_at: null,
    },
  }
  const slides: Record<string, TestSlide> = {
    'slide-vision': {
      id: 'slide-vision',
      parent_id: launchFolderId,
      slide_name: 'Vision',
      metadata: {
        textContent: [
          'Our north star vision for the product launch covering positioning and impact.',
        ],
        slideNumber: 2,
      },
      created_at: daysFromBase(-24),
      updated_at: daysFromBase(-2),
      object_id: 'obj-vision',
      tags: ['vision', 'strategy'],
      visibility: 'internal',
      description: 'Vision statement and transformation story.',
      parent_path: '/BrandCampaigns/ProductLaunch',
      organization_id: organizationId,
      project_id: brandProjectId,
      searchText:
        'vision statement transformation story positioning impact launch strategy',
      has_chart: false,
      has_table: false,
      has_diagram: true,
      has_image: true,
      has_bullet: true,
      has_links: false,
      has_video: false,
      has_audio: false,
      deleted_at: null,
    },
    'slide-roadmap': {
      id: 'slide-roadmap',
      parent_id: launchFolderId,
      slide_name: 'Roadmap',
      metadata: {
        textContent: ['Milestones and timeline for the multi-phase launch roadmap.'],
        slideNumber: 5,
      },
      created_at: daysFromBase(-23),
      updated_at: daysFromBase(-2),
      object_id: 'obj-roadmap',
      tags: ['roadmap', 'timeline'],
      visibility: 'restricted',
      description: 'Timeline view with critical launch checkpoints.',
      parent_path: '/BrandCampaigns/ProductLaunch',
      organization_id: organizationId,
      project_id: brandProjectId,
      searchText: 'roadmap timeline milestones gantt ownership launch checkpoints',
      has_chart: true,
      has_table: true,
      has_diagram: false,
      has_image: false,
      has_bullet: true,
      has_links: true,
      has_video: false,
      has_audio: false,
      deleted_at: null,
    },
    'slide-color-system': {
      id: 'slide-color-system',
      parent_id: designFolderId,
      slide_name: 'ColorSystem',
      metadata: {
        textContent: ['Palette exploration and accessibility checks.'],
        slideNumber: 3,
      },
      created_at: daysFromBase(-17),
      updated_at: daysFromBase(-1),
      object_id: 'obj-color-system',
      tags: ['design', 'palette'],
      visibility: 'restricted',
      description: 'Color palette updates with WCAG contrast validation.',
      parent_path: '/BrandCampaigns/DesignReviews',
      organization_id: organizationId,
      project_id: brandProjectId,
      searchText: 'color palette accessibility wcag contrast design review',
      has_chart: false,
      has_table: false,
      has_diagram: true,
      has_image: true,
      has_bullet: false,
      has_links: false,
      has_video: false,
      has_audio: false,
      deleted_at: null,
    },
    'slide-discovery': {
      id: 'slide-discovery',
      parent_id: playbookFolderId,
      slide_name: 'DiscoveryQuestions',
      metadata: {
        textContent: ['Key discovery questions for first customer call.'],
        slideNumber: 4,
      },
      created_at: daysFromBase(-36),
      updated_at: daysFromBase(-3),
      object_id: 'obj-discovery',
      tags: ['discovery', 'enablement'],
      visibility: 'internal',
      description: 'Framework for uncovering customer pain points.',
      parent_path: '/SalesEnablement/Playbooks',
      organization_id: organizationId,
      project_id: salesProjectId,
      searchText: 'discovery questions framework customer pain points call prep',
      has_chart: false,
      has_table: false,
      has_diagram: false,
      has_image: false,
      has_bullet: true,
      has_links: true,
      has_video: false,
      has_audio: false,
      deleted_at: null,
    },
    'slide-pricing': {
      id: 'slide-pricing',
      parent_id: playbookFolderId,
      slide_name: 'PricingComparison',
      metadata: {
        textContent: ['Competitive comparison with pricing guardrails.'],
        slideNumber: 6,
      },
      created_at: daysFromBase(-35),
      updated_at: daysFromBase(-3),
      object_id: 'obj-pricing',
      tags: ['pricing', 'competition'],
      visibility: 'restricted',
      description: 'Competitive matrix with objection handling cues.',
      parent_path: '/SalesEnablement/Playbooks',
      organization_id: organizationId,
      project_id: salesProjectId,
      searchText: 'pricing comparison competitive matrix objection handling',
      has_chart: true,
      has_table: true,
      has_diagram: false,
      has_image: true,
      has_bullet: true,
      has_links: true,
      has_video: false,
      has_audio: false,
      deleted_at: null,
    },
    'slide-customer-story': {
      id: 'slide-customer-story',
      parent_id: galleryFolderId,
      slide_name: 'CustomerStory',
      metadata: {
        textContent: ['Case study summarizing ROI from ACME pilot.'],
        slideNumber: 2,
      },
      created_at: daysFromBase(-30),
      updated_at: daysFromBase(-4),
      object_id: 'obj-customer-story',
      tags: ['customer', 'story'],
      visibility: 'public',
      description: 'Customer success story with measurable outcomes.',
      parent_path: '/SalesEnablement/CustomerStories',
      organization_id: organizationId,
      project_id: salesProjectId,
      searchText: 'customer story roi case study measurable outcomes',
      has_chart: true,
      has_table: false,
      has_diagram: false,
      has_image: true,
      has_bullet: true,
      has_links: true,
      has_video: false,
      has_audio: false,
      deleted_at: null,
    },
  }
  const pathToFolderId: Record<string, string> = {} as Record<string, string>
  pathToFolderId[organizationId + '|BrandCampaigns'] = brandProjectId
  pathToFolderId[organizationId + '|BrandCampaigns/ProductLaunch'] = launchFolderId
  pathToFolderId[organizationId + '|BrandCampaigns/DesignReviews'] = designFolderId
  pathToFolderId[organizationId + '|SalesEnablement'] = salesProjectId
  pathToFolderId[organizationId + '|SalesEnablement/Playbooks'] = playbookFolderId
  pathToFolderId[organizationId + '|SalesEnablement/CustomerStories'] = galleryFolderId

  return {
    users,
    userProfiles,
    organizations,
    folders,
    folderChildren,
    presentations,
    slides,
    pathToFolderId,
    sessions: {},
    passwordResets: [],
  }
}
function getStore(): TestStore {
  const globalAny = globalThis as Record<string, unknown>
  if (!globalAny[GLOBAL_KEY]) {
    globalAny[GLOBAL_KEY] = makeInitialStore()
  }
  return globalAny[GLOBAL_KEY] as TestStore
}

export function resetTestStore(): void {
  const globalAny = globalThis as Record<string, unknown>
  globalAny[GLOBAL_KEY] = makeInitialStore()
}
export function findUserByEmail(email: string) {
  const store = getStore()
  const lower = email.toLowerCase()
  return Object.values(store.users).find(
    (user) => user.email.toLowerCase() === lower,
  )
}

export function getUserById(userId: string) {
  const store = getStore()
  return store.users[userId] ?? null
}

export function createUser({
  email,
  password,
  firstName,
  lastName,
  position,
}: {
  email: string
  password: string
  firstName: string
  lastName: string
  position?: string
}) {
  const existing = findUserByEmail(email)
  if (existing) {
    throw new Error('User already exists')
  }

  const store = getStore()
  const id = 'user-' + randomUUID()

  const resolvedPosition = position || 'Contributor'

  store.users[id] = {
    id,
    email,
    password,
    firstName,
    lastName,
    position: resolvedPosition,
    organizationRoles: [{ organizationId: 'org-acme', role: 'member' }],
    folderRoles: [],
  }

  store.userProfiles[id] = {
    id,
    email,
    deleted_at: null,
    deleted_by: null,
    metadata: {
      firstName,
      lastName,
      position: resolvedPosition,
    },
  }

  return store.users[id]
}

export function createSession(userId: string) {
  const store = getStore()
  const token = randomUUID()
  store.sessions[token] = {
    token,
    userId,
    createdAt: Date.now(),
  }
  return token
}

export function getSession(token: string | undefined | null) {
  if (!token) return null
  const store = getStore()
  return store.sessions[token] ?? null
}

export function deleteSession(token: string | undefined | null) {
  if (!token) return
  const store = getStore()
  delete store.sessions[token]
}
export function getUserRoles(userId: string): UserRoles {
  const user = getUserById(userId)
  if (!user) {
    return {
      organizationRoles: [],
      folderRoles: [],
    }
  }

  return {
    organizationRoles: user.organizationRoles.map((item) => item.organizationId),
    folderRoles: user.folderRoles.map((item) => ({
      folder_id: item.folderId,
      user_role: item.role,
    })),
  }
}

export function getOrganizationByName(name: string) {
  const store = getStore()
  const lower = name.toLowerCase()
  return Object.values(store.organizations).find(
    (org) => org.organization_name.toLowerCase() === lower,
  )
}

export function getOrganizationById(id: string) {
  const store = getStore()
  return store.organizations[id] ?? null
}

export function listProjects(organizationId: string): Project[] {
  const store = getStore()
  return Object.values(store.folders).filter(
    (folder) => folder.organization_id === organizationId && folder.parent_id === null,
  )
}

export function getFolderById(folderId: string) {
  const store = getStore()
  return store.folders[folderId] ?? null
}

export function findFolderIdByPath(
  organizationId: string,
  path: string,
): string | null {
  const store = getStore()
  const trimmed = path.startsWith('/') ? path.slice(1) : path
  return store.pathToFolderId[organizationId + '|' + trimmed] ?? null
}

export function getRootFolderId(folderId: string): string | null {
  let current = getFolderById(folderId)
  if (!current) return null

  while (current.parent_id) {
    const parent = getFolderById(current.parent_id)
    if (!parent) {
      break
    }
    current = parent
  }

  return current.id
}

export function getSubFolderIds(folderId: string): string[] {
  const store = getStore()
  const result: string[] = []

  function traverse(id: string) {
    result.push(id)
    const children = store.folderChildren[id]
    if (!children) return
    children.folders.forEach(traverse)
  }

  traverse(folderId)
  return result
}
export function getFolderContent(folderId: string): FolderContent {
  const store = getStore()
  const children = store.folderChildren[folderId] || {
    folders: [],
    presentations: [],
    slides: [],
  }

  return {
    folders: children.folders
      .map((childId) => store.folders[childId])
      .filter((value): value is TestFolder => Boolean(value)),
    presentations: children.presentations
      .map((presentationId) => store.presentations[presentationId])
      .filter((value): value is TestPresentation => Boolean(value)),
    slides: children.slides
      .map((slideId) => store.slides[slideId])
      .filter((value): value is TestSlide => Boolean(value)),
  }
}

export function getSlide(parentId: string, slideName: string) {
  const store = getStore()
  return Object.values(store.slides).find(
    (slide) => slide.parent_id === parentId && slide.slide_name === slideName,
  )
}

export function getPresentation(parentId: string, presentationName: string) {
  const store = getStore()
  return Object.values(store.presentations).find(
    (presentation) =>
      presentation.parent_id === parentId &&
      presentation.presentation_name === presentationName,
  )
}
export function updateUserProfileMetadata(
  userId: string,
  metadata: TestUserProfile['metadata'],
) {
  const store = getStore()

  if (!store.userProfiles[userId]) {
    store.userProfiles[userId] = {
      id: userId,
      email: '',
      deleted_at: null,
      deleted_by: null,
      metadata,
    }
  } else {
    store.userProfiles[userId].metadata = {
      ...store.userProfiles[userId].metadata,
      ...metadata,
    }
  }

  if (store.users[userId]) {
    store.users[userId].firstName = metadata.firstName
    store.users[userId].lastName = metadata.lastName
    store.users[userId].position = metadata.position
  }

  return store.userProfiles[userId]
}

export function getUserProfile(userId: string) {
  const store = getStore()
  return store.userProfiles[userId] ?? null
}

export function getUserOrganizationRole(
  organizationId: string,
  userId: string,
): string | null {
  const user = getUserById(userId)
  if (!user) return null
  const entry = user.organizationRoles.find(
    (item) => item.organizationId === organizationId,
  )
  return entry ? entry.role : null
}
export function createProjectRecord(
  organizationId: string,
  folderName: string,
  options: {
    description?: string
    tags?: string[]
    visibility?: Project['visibility']
    userId: string
  },
) {
  const store = getStore()
  const normalizedName = folderName.toLowerCase()

  const duplicate = Object.values(store.folders).find(
    (folder) =>
      folder.organization_id === organizationId &&
      folder.parent_id === null &&
      folder.folder_name.toLowerCase() === normalizedName,
  )

  if (duplicate) {
    throw new Error('A project with this name already exists')
  }

  const id = 'folder-' + randomUUID()

  const newProject: TestFolder = {
    id,
    organization_id: organizationId,
    parent_id: null,
    folder_name: folderName,
    full_path: '/' + folderName,
    tags: options.tags || [],
    visibility: options.visibility || 'internal',
    metadata: options.description ? { description: options.description } : {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  }

  store.folders[id] = newProject
  store.folderChildren[id] = { folders: [], presentations: [], slides: [] }
  store.folderChildren.root.folders.push(id)
  store.pathToFolderId[organizationId + '|' + folderName] = id

  const user = getUserById(options.userId)
  if (user) {
    const hasOrgRole = user.organizationRoles.some(
      (entry) => entry.organizationId === organizationId,
    )
    if (!hasOrgRole) {
      user.organizationRoles.push({ organizationId, role: 'member' })
    }
    user.folderRoles.push({ folderId: id, role: 'admin' })
  }

  return newProject
}

export function updateProjectRecord(
  projectId: string,
  updates: {
    folderName?: string
    description?: string
    tags?: string[]
    visibility?: Project['visibility']
  },
) {
  const store = getStore()
  const project = store.folders[projectId]

  if (!project || project.parent_id !== null) {
    throw new Error('Project not found')
  }

  if (updates.folderName && updates.folderName !== project.folder_name) {
    const conflict = Object.values(store.folders).find(
      (folder) =>
        folder.parent_id === null &&
        folder.organization_id === project.organization_id &&
        folder.folder_name.toLowerCase() === updates.folderName!.toLowerCase(),
    )

    if (conflict) {
      throw new Error('A project with this name already exists')
    }

    delete store.pathToFolderId[
      project.organization_id + '|' + project.folder_name
    ]
    project.folder_name = updates.folderName
    project.full_path = '/' + updates.folderName
    store.pathToFolderId[
      project.organization_id + '|' + updates.folderName
    ] = projectId
  }

  if (updates.description !== undefined) {
    const existingMetadata = (project.metadata as Record<string, unknown>) || {}
    project.metadata = {
      ...existingMetadata,
      description: updates.description || undefined,
    }
  }

  if (updates.tags) {
    project.tags = updates.tags
  }

  if (updates.visibility) {
    project.visibility = updates.visibility
  }

  project.updated_at = new Date().toISOString()
  return project
}

export function deleteProjectRecord(projectId: string) {
  const store = getStore()
  const project = store.folders[projectId]

  if (!project || project.parent_id !== null) {
    throw new Error('Project not found')
  }

  function removeFolder(folderId: string) {
    const children = store.folderChildren[folderId]
    if (children) {
      children.folders.forEach(removeFolder)
      children.presentations.forEach((presentationId) => {
        delete store.presentations[presentationId]
      })
      children.slides.forEach((slideId) => {
        delete store.slides[slideId]
      })
      delete store.folderChildren[folderId]
    }
    delete store.folders[folderId]
  }

  removeFolder(projectId)

  store.folderChildren.root.folders = store.folderChildren.root.folders.filter(
    (id) => id !== projectId,
  )

  delete store.pathToFolderId[
    project.organization_id + '|' + project.folder_name
  ]

  Object.values(store.users).forEach((user) => {
    user.folderRoles = user.folderRoles.filter(
      (role) => role.folderId !== projectId,
    )
  })
}
export function searchSlidesInStore(
  query: string,
  options: {
    organizationId?: string | null
    limit?: number
    offset?: number
    permittedFolderIds: string[]
    permittedOrgIds: string[]
  },
) {
  const store = getStore()
  const lowerQuery = query.trim().toLowerCase()

  let pool = Object.values(store.slides)

  if (options.organizationId) {
    pool = pool.filter(
      (slide) => slide.organization_id === options.organizationId,
    )
  }

  const filtered = pool.filter((slide) => {
    if (!lowerQuery) return true
    return slide.searchText.toLowerCase().includes(lowerQuery)
  })

  const visible = filtered.filter((slide) => {
    if (slide.visibility === 'public') {
      return true
    }
    if (slide.visibility === 'internal') {
      return options.permittedOrgIds.includes(slide.organization_id)
    }
    if (slide.visibility === 'restricted') {
      return options.permittedFolderIds.includes(slide.project_id)
    }
    return false
  })

  const total = visible.length
  const start = options.offset || 0
  const end = options.limit ? start + options.limit : undefined
  const paginated = visible.slice(start, end)

  const results: SearchResult[] = paginated.map((slide) => ({
    id: slide.id,
    object_id: slide.object_id,
    parent_id: slide.parent_id,
    parent_path: slide.parent_path ?? null,
    visibility: (slide.visibility || 'internal') as SearchResult['visibility'],
    organization_id: slide.organization_id,
    project_id: slide.project_id,
    tags: slide.tags || [],
    slide_text: slide.metadata?.textContent?.join(' ') ?? '',
    notes_text: '',
    has_chart: Boolean(slide.has_chart),
    has_table: Boolean(slide.has_table),
    has_diagram: Boolean(slide.has_diagram),
    has_image: Boolean(slide.has_image),
    has_bullet: Boolean(slide.has_bullet),
    has_links: Boolean(slide.has_links),
    links: [],
    has_video: Boolean(slide.has_video),
    has_audio: Boolean(slide.has_audio),
    layout_name: 'Standard',
    theme_name: 'Default',
    slide_name: slide.slide_name || 'Untitled Slide',
    description: slide.description || '',
    created_at: slide.created_at,
    updated_at: slide.updated_at,
    imageUrl:
      'https://placehold.co/600x338?text=' +
      encodeURIComponent(slide.slide_name || 'Slide'),
  }))

  return {
    total,
    results,
  }
}
export function recordPasswordResetRequest(email: string) {
  const store = getStore()
  const token = randomUUID()
  store.passwordResets.push({
    email,
    token,
    requestedAt: Date.now(),
  })
  return token
}

export function getMostRecentPasswordReset() {
  const store = getStore()
  if (store.passwordResets.length === 0) return null
  return store.passwordResets[store.passwordResets.length - 1]
}
export function simulateUpload(args: {
  organizationId: string
  folderId: string
  userId: string
  presentationName: string
  visibility: Project['visibility']
  originalFileName: string
}) {
  const store = getStore()
  const presentationId = 'presentation-' + randomUUID()
  const slideId = 'slide-' + randomUUID()
  const slideObjectId = 'obj-' + randomUUID()

  const parentFolder = getFolderById(args.folderId)
  if (!parentFolder) {
    throw new Error('Folder not found')
  }

  const projectRootId = getRootFolderId(args.folderId)
  if (!projectRootId) {
    throw new Error('Project not found for folder')
  }

  const presentation: TestPresentation = {
    id: presentationId,
    parent_id: args.folderId,
    presentation_name: args.presentationName,
    metadata: {
      description: 'Imported from ' + args.originalFileName,
      slideCount: 1,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['uploaded'],
    slides: [{ order: 1, slide_id: slideId, object_id: slideObjectId }],
    settings: {
      pptxDownloadRole: 'project-member',
      pdfDownloadRole: 'project-member',
      chatRole: 'project-contributor',
      aspectRatio: '16:9',
    },
    version: 1,
    deleted_at: null,
  }

  const slide: TestSlide = {
    id: slideId,
    parent_id: args.folderId,
    slide_name: args.presentationName + '-Slide1',
    metadata: {
      textContent: ['Auto-generated slide from ' + args.originalFileName],
      slideNumber: 1,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    object_id: slideObjectId,
    tags: ['uploaded'],
    visibility: args.visibility || 'internal',
    description: 'Auto-generated preview for ' + args.originalFileName,
    parent_path: parentFolder.full_path ?? '',
    organization_id: args.organizationId,
    project_id: projectRootId,
    searchText:
      args.presentationName + ' uploaded ' + args.originalFileName,
    has_chart: false,
    has_table: false,
    has_diagram: false,
    has_image: true,
    has_bullet: true,
    has_links: false,
    has_video: false,
    has_audio: false,
    deleted_at: null,
  }

  store.presentations[presentationId] = presentation
  store.slides[slideId] = slide

  if (!store.folderChildren[args.folderId]) {
    store.folderChildren[args.folderId] = {
      folders: [],
      presentations: [],
      slides: [],
    }
  }

  store.folderChildren[args.folderId].presentations.push(presentationId)
  store.folderChildren[args.folderId].slides.push(slideId)

  return {
    presentation,
    slide,
  }
}
