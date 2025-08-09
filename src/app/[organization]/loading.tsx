export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Organization header skeleton */}
        <div className="animate-pulse">
          <div className="flex items-start space-x-6">
            <div className="h-24 w-24 rounded-full bg-gray-200"></div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 h-8 w-1/3 rounded bg-gray-200"></div>
              <div className="mb-2 h-4 w-2/3 rounded bg-gray-200"></div>
              <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              <div className="mt-4 flex space-x-2">
                <div className="h-6 w-16 rounded-full bg-gray-200"></div>
                <div className="h-6 w-20 rounded-full bg-gray-200"></div>
                <div className="h-6 w-14 rounded-full bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects section skeleton */}
        <div className="mt-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <div className="mb-2 h-6 w-24 rounded bg-gray-200"></div>
              <div className="h-4 w-40 rounded bg-gray-200"></div>
            </div>
          </div>

          {/* Project cards skeleton */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg border border-gray-200 bg-white p-6"
              >
                <div className="mb-3 h-6 w-3/4 rounded bg-gray-200"></div>
                <div className="mb-2 h-4 w-full rounded bg-gray-200"></div>
                <div className="mb-4 h-4 w-5/6 rounded bg-gray-200"></div>
                <div className="flex space-x-2">
                  <div className="h-5 w-12 rounded-full bg-gray-200"></div>
                  <div className="h-5 w-16 rounded-full bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
