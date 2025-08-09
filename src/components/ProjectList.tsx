'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Tables } from '../../types/database.types'

type Folder = Pick<
  Tables<'folders'>,
  'id' | 'folder_name' | 'full_path' | 'tags' | 'visibility'
>

interface ProjectListProps {
  projects: Folder[]
  organizationName: string
}

function ProjectCard({
  project,
  organizationName,
}: {
  project: Folder
  organizationName: string
}) {
  const visibilityColors = {
    public: 'bg-green-100 text-green-800',
    private: 'bg-red-100 text-red-800',
    restricted: 'bg-yellow-100 text-yellow-800',
  }

  const visibilityColor = project.visibility
    ? visibilityColors[project.visibility]
    : 'bg-gray-100 text-gray-800'

  return (
    <Link
      href={`/${organizationName}/${project.folder_name}`}
      className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-gray-900">
            {project.folder_name}
          </h3>

          {project.full_path && (
            <p className="mt-1 truncate text-sm text-gray-500">
              {project.full_path}
            </p>
          )}

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800"
                >
                  {tag}
                </span>
              ))}
              {project.tags.length > 3 && (
                <span className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                  +{project.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Visibility Badge */}
        {project.visibility && (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${visibilityColor}`}
          >
            {project.visibility}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium text-sky-600">View project →</span>

        <div className="text-xs text-gray-400">
          {/* Placeholder for additional metadata like last updated */}
          Project
        </div>
      </div>
    </Link>
  )
}

export default function ProjectList({
  projects,
  organizationName,
}: ProjectListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVisibility, setSelectedVisibility] = useState<string>('all')

  // Filter projects based on search term and visibility
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.folder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      )

    const matchesVisibility =
      selectedVisibility === 'all' || project.visibility === selectedVisibility

    return matchesSearch && matchesVisibility
  })

  if (projects.length === 0) {
    return (
      <div className="mt-6 py-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
        <p className="mt-1 text-sm text-gray-500">
          This organization hasn&apos;t created any projects yet.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6">
      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search projects
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              id="search"
              name="search"
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-10 leading-5 placeholder-gray-500 focus:border-sky-500 focus:placeholder-gray-400 focus:ring-1 focus:ring-sky-500 focus:outline-none sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:w-48">
          <label htmlFor="visibility" className="sr-only">
            Filter by visibility
          </label>
          <select
            id="visibility"
            name="visibility"
            value={selectedVisibility}
            onChange={(e) => setSelectedVisibility(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
          >
            <option value="all">All visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="restricted">Restricted</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      {(searchTerm || selectedVisibility !== 'all') && (
        <div className="mb-4 text-sm text-gray-600">
          {filteredProjects.length === 0
            ? 'No projects match your filters'
            : `${filteredProjects.length} of ${projects.length} projects`}
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              organizationName={organizationName}
            />
          ))}
        </div>
      ) : searchTerm || selectedVisibility !== 'all' ? (
        <div className="py-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No matching projects
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : null}
    </div>
  )
}
