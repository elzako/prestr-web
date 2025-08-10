import { getUser, getUserProfile } from '@/lib/auth-actions'
import { Header } from './Header'
import { AuthHeader } from './AuthHeader'

export async function HeaderWrapper() {
  const user = await getUser()

  if (!user) {
    return <Header />
  }

  const userProfile = await getUserProfile()

  return <AuthHeader user={user} userProfile={userProfile || undefined} />
}
