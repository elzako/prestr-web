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
  parent_path: string | null
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
    <Link
      href={`/${organizationName}${result.parent_path}/${result.slide_name}.slide`}
      className="group relative block overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Main Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        {result.imageUrl ? (
          <img
            src={result.imageUrl}
            alt={result.slide_name || 'Slide thumbnail'}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <svg
              className="h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        )}

        {/* Hover Overlay with Metadata */}
        <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex h-full flex-col justify-between p-4">
            {/* Top section - Tags */}
            <div>
              {result.tags && result.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {result.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded bg-white/20 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                  {result.tags.length > 3 && (
                    <span className="inline-flex items-center rounded bg-white/20 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      +{result.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Middle section - Description/Content */}
            <div className="flex flex-1 items-center justify-center">
              {result.description && (
                <p className="line-clamp-3 text-center text-sm text-white/90">
                  {result.description}
                </p>
              )}
            </div>

            {/* Bottom section - Features and Visibility */}
            <div className="flex items-end justify-between">
              {/* Features */}
              <div className="flex flex-wrap gap-1">
                {features.slice(0, 3).map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center rounded bg-blue-500/80 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm"
                  >
                    {feature}
                  </span>
                ))}
                {features.length > 3 && (
                  <span className="inline-flex items-center rounded bg-blue-500/80 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    +{features.length - 3}
                  </span>
                )}
              </div>

              {/* Visibility badge */}
              <span className="inline-flex items-center rounded bg-white/20 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {result.visibility}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Title - Always visible */}
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-sky-600">
          {result.slide_name || 'Untitled Slide'}
        </h3>
      </div>
    </Link>
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
      <div className="mb-6 text-sm text-gray-600">
        Found {total} result{total === 1 ? '' : 's'} for "{searchQuery}"
      </div>

      {/* Masonry-style grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {results.map((result) => (
          <SearchResultCard
            key={result.id}
            result={result}
            organizationName={organizationName}
          />
        ))}
      </div>

      {results.length < total && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Showing {results.length} of {total} results
          </p>
          {/* TODO: Add pagination */}
        </div>
      )}
    </div>
  )
}
