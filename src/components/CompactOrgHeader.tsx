'use client'

import type { OrgHeaderProps } from '@/types'
import { PencilIcon, UserGroupIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'
import { useState } from 'react'
import ActionDropdown, { ActionItem } from './ActionDropdown'
import OrganizationProfileModal from './OrganizationProfileModal'

export default function CompactOrgHeader({
  organization,
  userRole,
}: OrgHeaderProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentOrganization, setCurrentOrganization] = useState(organization)

  const metadata = currentOrganization.metadata as {
    name?: string
    about?: string
    website?: string
    location?: string
    profilePicture?: string
    displayMembers?: boolean
  } | null

  const displayName = metadata?.name || currentOrganization.organization_name
  const profilePicture = metadata?.profilePicture

  const handleEditProfile = () => {
    setIsEditModalOpen(true)
  }

  const handleProfileUpdate = (updatedOrganization: typeof organization) => {
    setCurrentOrganization(updatedOrganization)
  }

  const actionItems: ActionItem[] = [
    {
      id: 'edit-profile',
      label: 'Edit profile',
      icon: <PencilIcon className="h-5 w-5" />,
      onClick: handleEditProfile,
    },
    {
      id: 'manage-members',
      label: 'Manage members',
      icon: <UserGroupIcon className="h-5 w-5" />,
      onClick: () => {}, // TODO: Implement member management
    },
  ]

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Organization Info - Compact Layout */}
          <div className="flex items-center space-x-3">
            {/* Small Profile Picture */}
            <div className="flex-shrink-0">
              {profilePicture ? (
                <Image
                  src={profilePicture}
                  alt={`${displayName} logo`}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                  <span className="text-sm font-bold text-gray-500">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Organization Name */}
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {displayName}
              </h1>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {userRole === 'owner' && <ActionDropdown items={actionItems} />}
          </div>
        </div>
      </div>

      {/* Organization Profile Edit Modal */}
      <OrganizationProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        organization={currentOrganization}
        onSuccess={handleProfileUpdate}
      />
    </div>
  )
}
