/**
 * Mock Meilisearch client for testing
 *
 * This provides mock implementations for Meilisearch search operations
 * to avoid making real API calls during tests.
 */

export const mockSearchMethod = jest.fn()
export const mockIndexMethod = jest.fn()

/**
 * Mock Meilisearch client
 */
export const mockMeilisearchClient = {
  index: mockIndexMethod.mockReturnValue({
    search: mockSearchMethod,
  }),
}

/**
 * Setup function to mock Meilisearch
 */
export function mockMeilisearch() {
  jest.mock('meilisearch', () => ({
    MeiliSearch: jest.fn(() => mockMeilisearchClient),
  }))
}

/**
 * Reset all Meilisearch mocks
 */
export function resetMeilisearchMocks() {
  mockSearchMethod.mockClear()
  mockIndexMethod.mockClear()
}

/**
 * Mock successful search response
 */
export const mockSearchResponse = {
  hits: [
    {
      id: 'slide-1',
      slide_name: 'Test Slide 1',
      slide_text: 'This is test slide content',
      organization_id: 'org-1',
      project_id: 'project-1',
      parent_id: 'folder-1',
      object_id: 'object-1',
      visibility: 'public',
      description: 'Test description',
    },
    {
      id: 'slide-2',
      slide_name: 'Test Slide 2',
      slide_text: 'This is another test slide',
      organization_id: 'org-1',
      project_id: 'project-1',
      parent_id: 'folder-1',
      object_id: 'object-2',
      visibility: 'internal',
      description: 'Another test description',
    },
  ],
  estimatedTotalHits: 2,
  offset: 0,
  limit: 20,
  processingTimeMs: 1,
  query: 'test',
}

/**
 * Mock empty search response
 */
export const mockEmptySearchResponse = {
  hits: [],
  estimatedTotalHits: 0,
  offset: 0,
  limit: 20,
  processingTimeMs: 1,
  query: '',
}
