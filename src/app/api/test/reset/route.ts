import { NextResponse } from 'next/server'

import { isE2ETestMode } from '@/lib/e2e/test-mode'
import { resetTestStore } from '@/lib/e2e/testStore'

export async function POST() {
  if (!isE2ETestMode()) {
    return NextResponse.json(
      { success: false, error: 'Test reset endpoint is disabled.' },
      { status: 403 },
    )
  }

  resetTestStore()

  return NextResponse.json({ success: true })
}
