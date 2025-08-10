import { redirect } from 'next/navigation'
import { getUser, getUserProfile } from '@/lib/auth-actions'
import { HeaderWrapper } from '@/components/HeaderWrapper'
import { Container } from '@/components/Container'

export default async function Dashboard() {
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
              Welcome to your Profile
            </h1>
            <div className="mt-8 space-y-6">
              <div className="rounded-lg border bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Account Information
                </h2>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{user.email}</dd>
                  </div>
                  {userProfile?.metadata?.firstName && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Name
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {userProfile.metadata.firstName}{' '}
                        {userProfile.metadata.lastName}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      User ID
                    </dt>
                    <dd className="font-mono text-sm text-gray-900">
                      {user.id}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Account Created
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(user.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg bg-blue-50 p-6">
                <h2 className="mb-2 text-lg font-semibold text-blue-900">
                  🎉 Authentication is working!
                </h2>
                <p className="text-blue-700">
                  You have successfully signed in with Supabase Server-Side
                  Authentication. This page is protected and requires
                  authentication to access.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </>
  )
}
