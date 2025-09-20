import {
  getUser,
  getUserProfile,
  getUserOrganization,
} from '@/lib/auth-actions'
import { Header } from './Header'
import { AuthHeader } from './AuthHeader'

export async function HeaderWrapper() {
  const user = await getUser()

  if (!user) {
    return <Header />
  }

  const [userProfile, userOrganization] = await Promise.all([
    getUserProfile(),
    getUserOrganization(),
  ])

  return (
    <AuthHeader
      user={user}
      userProfile={userProfile || undefined}
      userOrganization={userOrganization || undefined}
    />
  )
}
