export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="mb-6 h-4 w-64 rounded bg-gray-200"></div>
          <div className="mb-2 h-8 w-48 rounded bg-gray-200"></div>
          <div className="h-4 w-96 rounded bg-gray-200"></div>
        </div>

        <div className="mt-8">
          {/* Breadcrumb skeleton */}
          <div className="mb-6 flex animate-pulse items-center space-x-4">
            <div className="h-4 w-12 rounded bg-gray-200"></div>
            <div className="h-4 w-2 rounded bg-gray-200"></div>
            <div className="h-4 w-24 rounded bg-gray-200"></div>
          </div>

          {/* Title skeleton */}
          <div className="mb-6 animate-pulse">
            <div className="mb-2 h-6 w-32 rounded bg-gray-200"></div>
            <div className="h-4 w-64 rounded bg-gray-200"></div>
          </div>

          {/* Search and filter skeleton */}
          <div className="mb-6 flex animate-pulse flex-col gap-4 sm:flex-row">
            <div className="h-10 flex-1 rounded bg-gray-200"></div>
            <div className="h-10 rounded bg-gray-200 sm:w-48"></div>
          </div>

          {/* Content grid skeleton */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 h-6 w-3/4 rounded bg-gray-200"></div>
                      <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                    </div>
                    <div className="h-6 w-16 rounded bg-gray-200"></div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="h-4 w-20 rounded bg-gray-200"></div>
                    <div className="h-3 w-12 rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
