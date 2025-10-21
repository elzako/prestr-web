'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function MicrosoftFileEditor({
  wopiUrl,
  accessToken,
  accessTokenTtl,
}: {
  wopiUrl: string | null
  accessToken: string | null
  accessTokenTtl: number | null
}) {
  const frameHolderRef = useRef<HTMLSpanElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Early return if props are not set
    if (!wopiUrl || !accessToken || !accessTokenTtl) {
      console.error('WOPI props are not set')
      return
    }

    if (!frameHolderRef.current) return

    // Check if iframe already exists
    const existingFrame = frameHolderRef.current.querySelector('iframe')
    if (existingFrame) return

    const officeFrame = document.createElement('iframe')
    officeFrame.name = 'office_frame'
    officeFrame.id = 'office_frame'
    officeFrame.title = 'Office Frame'
    officeFrame.setAttribute('allowfullscreen', 'true')
    officeFrame.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-popups-to-escape-sandbox',
    )
    officeFrame.className = 'absolute inset-0 m-0 border-0 block w-full h-full'

    frameHolderRef.current.appendChild(officeFrame)
    formRef.current?.submit()

    // Cleanup function
    return () => {
      if (frameHolderRef.current) {
        const frame = frameHolderRef.current.querySelector('iframe')
        if (frame) {
          frameHolderRef.current.removeChild(frame)
        }
      }
    }
  }, [wopiUrl, accessToken, accessTokenTtl, router, searchParams])

  // Render null if props are not set
  if (!wopiUrl || !accessToken || !accessTokenTtl) {
    return null
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <form
        ref={formRef}
        id="office_form"
        name="office_form"
        target="office_frame"
        action={wopiUrl}
        method="post"
        className="hidden"
      >
        <input name="access_token" value={accessToken} type="hidden" />
        <input name="access_token_ttl" value={accessTokenTtl} type="hidden" />
      </form>
      <span ref={frameHolderRef} id="frameholder" />
    </div>
  )
}
