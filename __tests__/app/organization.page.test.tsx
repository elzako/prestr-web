import OrganizationPage from '../../src/app/[organization]/[[...slug]]/page'

const createClientMock = jest.fn()
const notFoundMock = jest.fn()

function reactStubFactory(testId: string) {
  const React = require('react')
  return () => React.createElement('div', { 'data-testid': testId })
}

jest.mock('next/navigation', () => ({
  notFound: (...args: unknown[]) => notFoundMock(...args),
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => createClientMock(),
}))

jest.mock('@/lib/organization-server-actions', () => ({
  getUserOrganizationRole: jest.fn().mockResolvedValue({
    success: true,
    role: 'member',
  }),
}))

jest.mock('@/lib/cloudinary', () => ({
  getSlideImageUrl: jest.fn(),
}))

jest.mock('@/components/OrgHeader', () => ({ OrgHeader: reactStubFactory('org-header') }))
jest.mock('@/components/ProjectList', () => ({ ProjectList: reactStubFactory('project-list') }))
jest.mock('@/components/FolderView', () => ({ FolderView: reactStubFactory('folder-view') }))
jest.mock('@/components/CompactOrgHeader', () => ({ CompactOrgHeader: reactStubFactory('compact-org-header') }))
jest.mock('@/components/PresentationView', () => ({ PresentationView: reactStubFactory('presentation-view') }))
jest.mock('@/components/SlideView', () => ({ SlideView: reactStubFactory('slide-view') }))

describe('OrganizationPage error handling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    createClientMock.mockImplementation(() => createSupabaseStub())
    notFoundMock.mockImplementation(() => {
      throw new Error('NOT_FOUND')
    })
  })

  it('invokes notFound when the organization cannot be loaded', async () => {
    const params = Promise.resolve({ organization: 'acme', slug: [] as string[] })

    await expect(OrganizationPage({ params })).rejects.toThrow('NOT_FOUND')
    expect(notFoundMock).toHaveBeenCalledTimes(1)
    expect(createClientMock).toHaveBeenCalled()
  })
})

function createSupabaseStub() {
  const queryBuilder = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    order: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
  }

  return {
    from: jest.fn(() => queryBuilder),
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
    },
  }
}

