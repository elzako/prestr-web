import { NextResponse } from 'next/server'

import { isE2ETestMode } from '@/lib/e2e/test-mode'
import { getMostRecentPasswordReset } from '@/lib/e2e/testStore'

export async function GET() {
  if (!isE2ETestMode()) {
    return NextResponse.json(
      { success: false, error: 'Password reset diagnostics disabled.' },
      { status: 403 },
    )
  }

  const latest = getMostRecentPasswordReset()

  return NextResponse.json({
    success: true,
    reset: latest,
  })
}
