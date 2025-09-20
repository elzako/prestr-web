import { redirect } from 'next/navigation'
import { getUser, getUserProfile } from '@/lib/auth-actions'
import { HeaderWrapper } from '@/components/HeaderWrapper'
import { Container } from '@/components/Container'
import { ProfileClient } from './ProfileClient'

export default async function ProfilePage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const userProfile = await getUserProfile()

  return (
    <>
      <HeaderWrapper />
      <main className="py-16">
        <Container>
          <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Your Profile
            </h1>
            <ProfileClient user={user} initialUserProfile={userProfile} />
          </div>
        </Container>
      </main>
    </>
  )
}
