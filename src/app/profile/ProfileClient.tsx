'use client'

import { useState } from 'react'
import { ProfileEditForm } from '@/components/ProfileEditForm'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface ProfileClientProps {
  user: User
  initialUserProfile: UserProfile | null
}

export function ProfileClient({
  user,
  initialUserProfile,
}: ProfileClientProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(
    initialUserProfile,
  )

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile)
  }

  return (
    <div className="mt-8">
      {/* Combined Profile Information */}
      <ProfileEditForm
        userProfile={userProfile}
        userId={user.id}
        user={user}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  )
}
