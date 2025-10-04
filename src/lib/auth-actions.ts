'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { isE2ETestMode } from '@/lib/e2e/test-mode'
import {
  createSession,
  deleteSession,
  findUserByEmail,
  createUser as createTestUser,
  getSession,
  getUserById,
  getUserProfile as getTestUserProfile,
  getOrganizationById,
  getUserOrganizationRole as getTestUserOrganizationRole,
  recordPasswordResetRequest,
  updateUserProfileMetadata,
} from '@/lib/e2e/testStore'

const SESSION_COOKIE_NAME = 'prestr-e2e-session'
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
}

interface SupabaseLikeUser {
  id: string
  email: string
  app_metadata: Record<string, unknown>
  user_metadata: {
    full_name: string
  }
  aud: string
  created_at: string
}

function mapTestUserToSupabaseUser(user: ReturnType<typeof getUserById>): SupabaseLikeUser {
  const firstName = user?.firstName || ''
  const lastName = user?.lastName || ''
  const fullName = (firstName + ' ' + lastName).trim()

  return {
    id: user?.id || '',
    email: user?.email || '',
    app_metadata: {},
    user_metadata: {
      full_name: fullName,
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  }
}

async function setTestSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS)
}

async function clearTestSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: 0,
  })
}

async function getTestSessionToken() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(SESSION_COOKIE_NAME)
  return cookie ? cookie.value : null
}

async function getTestUserFromSession() {
  const token = await getTestSessionToken()
  if (!token) {
    return null
  }
  const session = getSession(token)
  if (!session) {
    return null
  }
  const user = getUserById(session.userId)
  if (!user) {
    return null
  }
  return { user, token }
}

export async function login(formData: FormData) {
  if (isE2ETestMode()) {
    const email = String(formData.get('email') || '').trim().toLowerCase()
    const password = String(formData.get('password') || '')

    const user = findUserByEmail(email)
    if (!user || user.password !== password) {
      return { error: 'Invalid email or password' }
    }

    const token = createSession(user.id)
    await setTestSessionCookie(token)

    revalidatePath('/', 'layout')
    redirect('/')
  }

  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  if (isE2ETestMode()) {
    try {
      createTestUser({
        email: String(formData.get('email') || ''),
        password: String(formData.get('password') || ''),
        firstName: String(formData.get('first_name') || 'New'),
        lastName: String(formData.get('last_name') || 'User'),
        position: 'Contributor',
      })
      return {
        success: true,
        message: 'Account created successfully! You can sign in now.',
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create account'
      return { error: message }
    }
  }

  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Check your email to continue signing up' }
}

export async function logout() {
  if (isE2ETestMode()) {
    const session = await getTestUserFromSession()
    if (session) {
      deleteSession(session.token)
    }
    await clearTestSessionCookie()
    revalidatePath('/', 'layout')
    redirect('/login')
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getUser() {
  if (isE2ETestMode()) {
    const session = await getTestUserFromSession()
    if (!session) {
      return null
    }
    return mapTestUserToSupabaseUser(session.user)
  }

  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

export async function getUserProfile() {
  if (isE2ETestMode()) {
    const session = await getTestUserFromSession()
    if (!session) return null
    const profile = getTestUserProfile(session.user.id)
    return profile
  }

  const supabase = await createClient()
  const user = await getUser()

  if (!user) return null

  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return profile
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

export async function getUserOrganization() {
  if (isE2ETestMode()) {
    const session = await getTestUserFromSession()
    if (!session) return null

    const role = getTestUserOrganizationRole('org-acme', session.user.id)
    const organization = getOrganizationById('org-acme')

    if (!organization || !role) {
      return null
    }

    return {
      id: organization.id,
      organization_name: organization.organization_name,
      user_role: role,
    }
  }

  const supabase = await createClient()
  const user = await getUser()

  if (!user) return null

  try {
    const { data: organizationData, error } = await supabase
      .from('user_organization_roles')
      .select(
        `
        organization_id,
        user_role,
        organizations (
          id,
          organization_name
        )
      `,
      )
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user organization:', error)
      return null
    }

    if (!organizationData || 'message' in organizationData) {
      return null
    }

    if (!organizationData.organizations) {
      return null
    }

    return {
      id: organizationData.organizations.id,
      organization_name: organizationData.organizations.organization_name,
      user_role: organizationData.user_role,
    }
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

export async function updateUserProfileAction(params: {
  userId: string
  firstName: string
  lastName: string
  position: string
}) {
  if (isE2ETestMode()) {
    const updated = updateUserProfileMetadata(params.userId, {
      firstName: params.firstName,
      lastName: params.lastName,
      position: params.position,
    })
    return {
      id: updated.id,
      email: updated.email,
      metadata: updated.metadata,
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      metadata: {
        firstName: params.firstName,
        lastName: params.lastName,
        position: params.position,
      },
    })
    .eq('id', params.userId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function requestPasswordReset(email: string) {
  if (isE2ETestMode()) {
    const user = findUserByEmail(email)
    if (!user) {
      return { success: false, error: 'Email not found' }
    }
    recordPasswordResetRequest(user.email)
    return {
      success: true,
      message: 'Password reset email simulated for testing.',
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: process.env.NEXT_PUBLIC_SITE_URL
      ? process.env.NEXT_PUBLIC_SITE_URL + '/auth/confirm'
      : undefined,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    message: 'Check your inbox for password reset instructions.',
  }
}
