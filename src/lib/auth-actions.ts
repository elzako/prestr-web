'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Type-casting here for convenience
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
  const supabase = await createClient()

  // Type-casting here for convenience
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Check your email to continue signing up' }
}

export async function logout() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getUser() {
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

    return organizationData?.organizations
      ? {
          id: organizationData.organizations.id,
          organization_name: organizationData.organizations.organization_name,
          user_role: organizationData.user_role,
        }
      : null
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}
