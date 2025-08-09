import Image from 'next/image'
import type { Tables } from '../../types/database.types'

type Organization = Pick<
  Tables<'organizations'>,
  'id' | 'organization_name' | 'metadata' | 'tags'
>

interface OrgHeaderProps {
  organization: Organization
}

export default function OrgHeader({ organization }: OrgHeaderProps) {
  const metadata = organization.metadata as {
    name?: string
    about?: string
    website?: string
    location?: string
    profilePicture?: string
    displayMembers?: boolean
  } | null

  const displayName = metadata?.name || organization.organization_name
  const profilePicture = metadata?.profilePicture
  const about = metadata?.about
  const website = metadata?.website
  const location = metadata?.location

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="px-6 py-8">
        <div className="flex items-start space-x-6">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            {profilePicture ? (
              <Image
                src={profilePicture}
                alt={`${displayName} logo`}
                width={96}
                height={96}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200">
                <span className="text-2xl font-bold text-gray-500">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Organization Info */}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-3xl font-bold text-gray-900">
              {displayName}
            </h1>

            {about && (
              <p className="mt-2 text-lg leading-relaxed text-gray-600">
                {about}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {location && (
                <div className="flex items-center">
                  <svg
                    className="mr-1 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                  {location}
                </div>
              )}

              {website && (
                <a
                  href={
                    website.startsWith('http') ? website : `https://${website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sky-600 hover:text-sky-800"
                >
                  <svg
                    className="mr-1 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3s-4.5 4.03-4.5 9 2.015 9 4.5 9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3m0 0v3m0-3h3m-3 0H9m3-9a9 9 0 019 9v0a9 9 0 01-9 9v0a9 9 0 01-9-9v0a9 9 0 019-9z"
                    />
                  </svg>
                  Website
                </a>
              )}
            </div>

            {/* Tags */}
            {organization.tags && organization.tags.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {organization.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
