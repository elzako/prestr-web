import { NextResponse, type NextRequest } from 'next/server'
import type { Project } from '@/types'

import { isE2ETestMode } from '@/lib/e2e/test-mode'
import { getSession, getUserById, simulateUpload } from '@/lib/e2e/testStore'

const SESSION_COOKIE_NAME = 'prestr-e2e-session'

function getTestUserId(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)
  if (!cookie) {
    return null
  }

  const session = getSession(cookie.value)
  if (!session) {
    return null
  }

  const user = getUserById(session.userId)
  return user ? user.id : null
}

export async function POST(request: NextRequest) {
  if (!isE2ETestMode()) {
    return NextResponse.json(
      { success: false, error: 'Upload endpoint not implemented.' },
      { status: 501 },
    )
  }

  const url = new URL(request.url)
  const organizationId = url.searchParams.get('organizationId') || 'org-acme'
  const folderId = url.searchParams.get('folderId')
  const presentationName = url.searchParams.get('presentationName') || 'UploadedPresentation'
  const visibilityParam = url.searchParams.get('visibility')

  if (!folderId) {
    return NextResponse.json(
      { success: false, error: 'Folder ID is required.' },
      { status: 400 },
    )
  }

  const userId = getTestUserId(request)
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'User not authenticated.' },
      { status: 401 },
    )
  }

  // Consume the request body to avoid unhandled stream errors
  try {
    await request.blob()
  } catch (error) {
    console.error('Failed to read upload payload:', error)
  }

  const visibility: Project['visibility'] =
    visibilityParam === 'public' || visibilityParam === 'restricted' || visibilityParam === 'internal'
      ? (visibilityParam as Project['visibility'])
      : 'internal'

  try {
    const { presentation, slide } = simulateUpload({
      organizationId,
      folderId,
      userId,
      presentationName,
      visibility,
      originalFileName: presentationName + '.pptx',
    })

    return NextResponse.json({
      success: true,
      presentation,
      slide,
    })
  } catch (error) {
    console.error('Simulated upload error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 },
    )
  }
}
