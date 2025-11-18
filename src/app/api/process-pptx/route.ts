export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { Sandbox } from '@e2b/code-interpreter'

export async function POST(req: NextRequest) {
  const apiKey = process.env.NEXT_E2B_API_KEY

  if (!apiKey) {
    return new Response('NEXT_E2B_API_KEY is not set', { status: 500 })
  }

  // Expect multipart/form-data with "file"
  let file: File | null = null
  try {
    const formData = await req.formData()
    const maybeFile = formData.get('file')
    if (maybeFile instanceof File) file = maybeFile
  } catch {
    return new Response('Expected multipart/form-data with a "file" field', {
      status: 400,
    })
  }

  if (!file) {
    return new Response('No PPTX file provided in "file" field', {
      status: 400,
    })
  }

  const arrayBuffer = await file.arrayBuffer()
  const pptxBuffer = Buffer.from(arrayBuffer)

  // Initialize the sandbox using your custom template ID ('prestr-sandbox')
  // This template must have inventory.py pre-installed at /usr/local/bin/
  const sbx = await Sandbox.create('prestr-sandbox', {
    apiKey,
    timeoutMs: 120_000,
  })

  try {
    // 1) Upload the PPTX file
    await sbx.files.write(
      '/input.pptx',
      new Blob([pptxBuffer as unknown as ArrayBuffer]),
    )

    // 2) Run the pre-existing inventory script
    let execResult

    try {
      // Execute the script found at /usr/local/bin/inventory.py
      execResult = await sbx.commands.run(
        'python3 /usr/local/bin/inventory.py /input.pptx /tmp/output.json',
      )
    } catch (err: any) {
      console.error('Sandbox command failed:', err)
      if (err?.result) {
        console.error('EXIT CODE:', err.result.exitCode)
        console.error('STDOUT:', err.result.stdout)
        console.error('STDERR:', err.result.stderr)
      }
      return new Response('Python crashed — see server logs', { status: 500 })
    }

    if (execResult.exitCode !== 0) {
      console.error('inventory.py failed:', execResult)
      return new Response('PPTX processing failed in sandbox', { status: 500 })
    }

    // 3) Read JSON output
    const outputContent = await sbx.files.read('/tmp/output.json')

    // Quick sanity check
    try {
      JSON.parse(outputContent)
    } catch (err) {
      console.error('Invalid JSON output from inventory.py', err, outputContent)
      return new Response('Invalid JSON produced by inventory.py', {
        status: 500,
      })
    }

    return new Response(outputContent, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } finally {
    if (typeof (sbx as any).kill === 'function') {
      await (sbx as any).kill()
    }
  }
}
