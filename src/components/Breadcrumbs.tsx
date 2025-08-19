import Link from 'next/link'
import type { Tables } from '../../types/database.types'

type Organization = Pick<
  Tables<'organizations'>,
  'id' | 'organization_name' | 'metadata' | 'tags'
>

interface BreadcrumbsProps {
  organization: Organization
  currentPath: string
}

export default function Breadcrumbs({
  organization,
  currentPath,
}: BreadcrumbsProps) {
  const metadata = organization.metadata as {
    name?: string
    about?: string
    website?: string
    location?: string
    profilePicture?: string
    displayMembers?: boolean
  } | null

  const displayName = metadata?.name || organization.organization_name

  // Split the current path into segments
  const pathSegments = currentPath.split('/').filter(Boolean)

  // Build breadcrumb items
  const breadcrumbs = [
    {
      name: displayName,
      href: `/${organization.organization_name}`,
      current: pathSegments.length === 0,
    },
  ]

  // Add each path segment as a breadcrumb
  pathSegments.forEach((segment, index) => {
    const href = `/${organization.organization_name}/${pathSegments.slice(0, index + 1).join('/')}`
    const isLast = index === pathSegments.length - 1

    breadcrumbs.push({
      name: segment,
      href: href,
      current: isLast,
    })
  })

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-4">
        {breadcrumbs.map((item, index) => (
          <li key={item.href}>
            <div className="flex items-center">
              {index > 0 && (
                <svg
                  className="h-5 w-5 flex-shrink-0 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
              )}

              {item.current ? (
                <span
                  className="ml-4 text-sm font-medium text-gray-500"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  {item.name}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
