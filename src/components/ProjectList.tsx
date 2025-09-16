'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import type { Tables } from '../../types/database.types'
import CreateProjectModal from './CreateProjectModal'
import EditProjectModal from './EditProjectModal'
import ConfirmDialog from './ConfirmDialog'
import SearchResults from './SearchResults'
import { deleteProject, getUserOrganizationRole } from '@/lib/project-actions'
import type { UserRoles } from '@/app/[organization]/[[...slug]]/page'

type Project = Pick<
  Tables<'folders'>,
  | 'id'
  | 'folder_name'
  | 'full_path'
  | 'tags'
  | 'visibility'
  | 'metadata'
  | 'created_at'
  | 'updated_at'
>

interface ProjectListProps {
  projects: Project[]
  organizationName: string
  organizationId?: string
  userRoles?: UserRoles | null
}

function ProjectCard({
  project,
  organizationName,
  canManage,
  onEdit,
  onDelete,
}: {
  project: Project
  organizationName: string
  canManage: boolean
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}) {
  const visibilityColors = {
    public: 'bg-green-100 text-green-800',
    private: 'bg-red-100 text-red-800',
    restricted: 'bg-yellow-100 text-yellow-800',
  }

  const visibilityColor = project.visibility
    ? visibilityColors[project.visibility]
    : 'bg-gray-100 text-gray-800'

  const projectDescription = (project.metadata as { description?: string })
    ?.description

  return (
    <div className="group relative rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
      {/* Project Management Menu */}
      {canManage && (
        <div className="absolute top-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
          <Menu as="div" className="relative">
            <MenuButton className="flex items-center rounded-full p-2 text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none">
              <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
            </MenuButton>
            <MenuItems
              transition
              className="ring-opacity-5 absolute right-0 z-10 mt-1 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[enter]:ease-out data-[leave]:duration-75 data-[leave]:ease-in"
            >
              <MenuItem>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    onEdit(project)
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <PencilIcon className="mr-3 h-4 w-4" aria-hidden="true" />
                  Edit Project
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    onDelete(project)
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  <TrashIcon className="mr-3 h-4 w-4" aria-hidden="true" />
                  Delete Project
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      )}

      <Link
        href={`/${organizationName}/${project.folder_name}`}
        className="block"
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 pr-8">
            <h3 className="truncate text-lg font-semibold text-gray-900">
              {project.folder_name}
            </h3>

            {projectDescription && (
              <p className="mt-1 text-sm text-gray-500">{projectDescription}</p>
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
          <span className="text-sm font-medium text-sky-600">
            View project →
          </span>

          <div className="text-xs text-gray-400">
            Updated {new Date(project.updated_at).toLocaleDateString()}
          </div>
        </div>
      </Link>
    </div>
  )
}

export default function ProjectList({
  projects,
  organizationName,
  organizationId,
  userRoles,
}: ProjectListProps) {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchMode, setIsSearchMode] = useState(false)

  // Check user permissions
  useEffect(() => {
    const checkRole = async () => {
      const result = await getUserOrganizationRole(organizationName)
      if (result.success) {
        setUserRole(result.role)
      }
    }
    checkRole()
  }, [organizationName])

  const canManage = userRole === 'owner' || userRole === 'admin'

  const handleCreateSuccess = () => {
    // Refresh the page to show the new project
    window.location.reload()
  }

  const handleEditSuccess = () => {
    // Refresh the page to show the updated project
    window.location.reload()
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
  }

  const handleDelete = (project: Project) => {
    setDeletingProject(project)
  }

  const confirmDelete = async () => {
    if (!deletingProject) return

    setDeleteLoading(true)
    try {
      const result = await deleteProject(organizationName, deletingProject.id)
      if (result.success) {
        // Refresh the page to remove the deleted project
        window.location.reload()
      } else {
        console.error('Delete failed:', result.error)
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setDeleteLoading(false)
      setDeletingProject(null)
    }
  }

  const activateSearchMode = () => {
    setIsSearchMode(true)
  }

  const exitSearchMode = () => {
    setIsSearchMode(false)
    setSearchQuery('')
  }

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query)
  }

  if (projects.length === 0) {
    return (
      <div className="mt-6">
        {/* Create Project Button */}
        {canManage && (
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <PlusIcon className="mr-1.5 -ml-0.5 h-5 w-5" aria-hidden="true" />
              Create Project
            </button>
          </div>
        )}

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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No projects
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            This organization hasn&apos;t created any projects yet.
          </p>
          {canManage && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <PlusIcon
                  className="mr-1.5 -ml-0.5 h-5 w-5"
                  aria-hidden="true"
                />
                Create your first project
              </button>
            </div>
          )}
        </div>

        {/* Modals */}
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          organizationName={organizationName}
          onSuccess={handleCreateSuccess}
        />
      </div>
    )
  }

  return (
    <div className="mt-6">
      {/* Header with Create Button */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
        {/* Create Project Button */}
        {canManage && (
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="mr-1.5 -ml-0.5 h-5 w-5" aria-hidden="true" />
            Create Project
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search slides by content, tags, or features..."
            value={searchQuery}
            onChange={(e) => handleSearchQueryChange(e.target.value)}
            onFocus={activateSearchMode}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pr-10 pl-10 text-sm placeholder-gray-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
          />
          {isSearchMode && searchQuery && (
            <button
              onClick={exitSearchMode}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results or Projects Grid */}
      {isSearchMode && organizationId ? (
        <SearchResults
          organizationName={organizationName}
          organizationId={organizationId}
          projectId={null}
          subFolderIds={null}
          searchQuery={searchQuery}
          isSearchMode={isSearchMode}
          userRoles={userRoles || null}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              organizationName={organizationName}
              canManage={canManage}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        organizationName={organizationName}
        onSuccess={handleCreateSuccess}
      />

      <EditProjectModal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        organizationName={organizationName}
        project={editingProject}
        onSuccess={handleEditSuccess}
      />

      <ConfirmDialog
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={confirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.folder_name}"? This action cannot be undone and will also delete all folders, presentations, and slides within this project.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  )
}
