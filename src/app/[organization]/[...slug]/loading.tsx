export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gray-300" />
            <div className="space-y-2">
              <div className="h-6 w-48 rounded bg-gray-300" />
              <div className="h-4 w-32 rounded bg-gray-300" />
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="mt-8 animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="mb-6 flex items-center space-x-2">
            <div className="h-4 w-16 rounded bg-gray-300" />
            <div className="h-4 w-4 rounded bg-gray-300" />
            <div className="h-4 w-24 rounded bg-gray-300" />
          </div>

          {/* Title skeleton */}
          <div className="mb-6 space-y-2">
            <div className="h-8 w-64 rounded bg-gray-300" />
            <div className="h-4 w-96 rounded bg-gray-300" />
          </div>

          {/* Content grid skeleton */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="h-5 w-5 rounded bg-gray-300" />
                      <div className="h-5 w-32 rounded bg-gray-300" />
                    </div>
                    <div className="h-4 w-24 rounded bg-gray-300" />
                  </div>
                  <div className="h-6 w-16 rounded-full bg-gray-300" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="h-4 w-20 rounded bg-gray-300" />
                  <div className="h-4 w-16 rounded bg-gray-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
