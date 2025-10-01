/**
 * Test data factories for common entities
 *
 * These factories create mock data for testing purposes.
 * They provide default values that can be overridden as needed.
 */

import type {
  Organization,
  Project,
  Folder,
  Presentation,
  Slide,
} from '@/types'

let organizationIdCounter = 1
let projectIdCounter = 1
let folderIdCounter = 1
let presentationIdCounter = 1
let slideIdCounter = 1

/**
 * Create a mock organization
 */
export function createMockOrganization(
  overrides?: Partial<Organization>,
): Organization {
  const id = `org-${organizationIdCounter++}`
  return {
    id,
    organization_name: `test-org-${id}`,
    metadata: {},
    tags: [],

    ...overrides,
  }
}

/**
 * Create a mock project (top-level folder)
 */
export function createMockProject(overrides?: Partial<Project>): Project {
  const id = `project-${projectIdCounter++}`
  return {
    id,
    folder_name: `Test Project ${id}`,
    full_path: `test-project-${id}`,
    organization_id: 'org-1',
    parent_id: null,
    tags: [],
    visibility: 'internal',
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    ...overrides,
  }
}

/**
 * Create a mock folder
 */
export function createMockFolder(overrides?: Partial<Folder>): Folder {
  const id = `folder-${folderIdCounter++}`
  return {
    id,
    folder_name: `Test Folder ${id}`,
    full_path: `test-folder-${id}`,
    organization_id: 'org-1',
    parent_id: 'project-1',
    tags: [],
    visibility: 'internal',
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    ...overrides,
  }
}

/**
 * Create a mock presentation
 */
export function createMockPresentation(
  overrides?: Partial<Presentation>,
): Presentation {
  const id = `presentation-${presentationIdCounter++}`
  return {
    id,
    presentation_name: `Test Presentation ${id}`,
    parent_id: 'folder-1',
    tags: [],
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    ...overrides,
  }
}

/**
 * Create a mock slide
 */
export function createMockSlide(overrides?: Partial<Slide>): Slide {
  const id = `slide-${slideIdCounter++}`
  return {
    id,
    parent_id: 'presentation-1',
    slide_name: `Test Slide ${id}`,
    object_id: `object-${id}`,
    tags: [],
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    ...overrides,
  }
}

/**
 * Reset all counters (useful between tests)
 */
export function resetFactoryCounters() {
  organizationIdCounter = 1
  projectIdCounter = 1
  folderIdCounter = 1
  presentationIdCounter = 1
  slideIdCounter = 1
}
