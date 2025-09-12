'use client'

import { useDebounce } from '@/hooks/useDebounce'
import { searchSlides } from '@/lib/search-actions'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface SearchResult {
  id: string
  object_id: string
  visibility: 'public' | 'private' | 'restricted'
  organization_id: string
  project_id: string
  tags: string[] | null
  slide_text: string
  notes_text: string
  has_chart: boolean
  has_table: boolean
  has_diagram: boolean
  has_image: boolean
  has_bullet: boolean
  has_links: boolean
  links: string[]
  has_video: boolean
  has_audio: boolean
  layout_name: string
  theme_name: string
  slide_name: string
  description: string
  created_at: string
  updated_at: string
  imageUrl?: string
}

interface SearchResultsProps {
  organizationName: string
  organizationId: string
  searchQuery: string
  isSearchMode: boolean
}

function SearchResultCard({
  result,
  organizationName,
}: {
  result: SearchResult
  organizationName: string
}) {
  const visibilityColors = {
    public: 'bg-green-100 text-green-800',
    private: 'bg-red-100 text-red-800',
    restricted: 'bg-yellow-100 text-yellow-800',
  }

  const visibilityColor =
    visibilityColors[result.visibility] || 'bg-gray-100 text-gray-800'

  // Get content features
  const features = []
  if (result.has_chart) features.push('Chart')
  if (result.has_table) features.push('Table')
  if (result.has_diagram) features.push('Diagram')
  if (result.has_image) features.push('Image')
  if (result.has_bullet) features.push('Bullets')
  if (result.has_links) features.push('Links')
  if (result.has_video) features.push('Video')
  if (result.has_audio) features.push('Audio')

  return (
    <div className="group relative rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
      <div className="flex gap-4">
        {/* Slide Image */}
        {result.imageUrl && (
          <div className="flex-shrink-0">
            <div className="h-32 w-48 overflow-hidden rounded-lg bg-gray-100">
              <img
                src={result.imageUrl}
                alt={result.slide_name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-lg font-semibold text-gray-900">
                  {result.slide_name}
                </h3>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${visibilityColor}`}
                >
                  {result.visibility}
                </span>
              </div>

              {result.description && (
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                  {result.description}
                </p>
              )}

              {/* Layout and Theme */}
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                <span>{result.layout_name}</span>
                <span>•</span>
                <span>{result.theme_name}</span>
              </div>

              {/* Content Features */}
              {features.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {features.slice(0, 4).map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                    >
                      {feature}
                    </span>
                  ))}
                  {features.length > 4 && (
                    <span className="inline-flex items-center rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      +{features.length - 4} more
                    </span>
                  )}
                </div>
              )}

              {/* Tags */}
              {result.tags && result.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {result.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                  {result.tags.length > 3 && (
                    <span className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                      +{result.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Link
              href={`/${organizationName}/${result.slide_name}.slide`}
              className="text-sm font-medium text-sky-600 hover:text-sky-800"
            >
              View slide →
            </Link>
            <div className="text-xs text-gray-400">
              {new Date(result.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchResults({
  organizationName,
  organizationId,
  searchQuery,
  isSearchMode,
}: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  // Debounce search query to avoid excessive API calls
  const debouncedQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    if (!isSearchMode || !debouncedQuery.trim()) {
      setResults([])
      setTotal(0)
      setError(null)
      return
    }

    const performSearch = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await searchSlides({
          organizationId,
          query: debouncedQuery,
          limit: 20,
          offset: 0,
        })

        if (response.success) {
          setResults(response.results || [])
          setTotal(response.total || 0)
        } else {
          setError(response.error || 'Search failed')
          setResults([])
          setTotal(0)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
        setResults([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery, organizationId, isSearchMode])

  if (!isSearchMode) {
    return null
  }

  if (loading) {
    return (
      <div className="mt-6 flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-sky-600"></div>
          <span className="text-gray-600">Searching...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <MagnifyingGlassIcon className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Search Unavailable
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!searchQuery.trim()) {
    return (
      <div className="mt-6 py-12 text-center">
        <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Start typing to search
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Search across all slides in this organization.
        </p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="mt-6 py-12 text-center">
        <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No results found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search terms or check your spelling.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <div className="mb-4 text-sm text-gray-600">
        Found {total} result{total === 1 ? '' : 's'} for "{searchQuery}"
      </div>

      <div className="space-y-4">
        {results.map((result) => (
          <SearchResultCard
            key={result.id}
            result={result}
            organizationName={organizationName}
          />
        ))}
      </div>

      {results.length < total && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Showing {results.length} of {total} results
          </p>
          {/* TODO: Add pagination */}
        </div>
      )}
    </div>
  )
}
