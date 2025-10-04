'use client'

import { useState, useTransition } from 'react'

import { requestPasswordReset } from '@/lib/auth-actions'
import { Button } from '@/components/Button'
import { TextField } from '@/components/Fields'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!email.trim()) {
      setError('Email address is required')
      return
    }

    startTransition(async () => {
      const result = await requestPasswordReset(email.trim().toLowerCase())

      if (result.success) {
        setSuccess(result.message || 'Password reset email sent.')
      } else {
        setError(result.error || 'Unable to send password reset email.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-6">
      <TextField
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={isPending}
      />

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      <Button
        type="submit"
        variant="solid"
        color="blue"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? 'Sending reset link...' : 'Send reset link'}
      </Button>
    </form>
  )
}
