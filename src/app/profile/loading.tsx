import { Container } from '@/components/Container'
import { HeaderWrapper } from '@/components/HeaderWrapper'

export default function Loading() {
  return (
    <>
      <HeaderWrapper />
      <main className="py-16">
        <Container>
          <div className="mx-auto max-w-2xl">
            <div className="animate-pulse">
              <div className="mb-8 h-8 w-3/4 rounded-md bg-gray-200"></div>
              <div className="space-y-4 rounded-lg border bg-white p-6">
                <div className="h-6 w-1/4 rounded-md bg-gray-200"></div>
                <div className="space-y-3">
                  <div className="h-4 w-1/6 rounded-md bg-gray-200"></div>
                  <div className="h-4 w-2/3 rounded-md bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </>
  )
}
