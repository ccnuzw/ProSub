export const runtime = 'edge';
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ProfileForm from '@/components/ProfileForm'
import { Profile } from '@/types'

export default function EditProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const params = useParams()
  const { id } = params

  useEffect(() => {
    if (id) {
      const fetchProfile = async () => {
        const res = await fetch(`/api/profiles/${id}`)
        if (res.ok) {
          const data = (await res.json()) as Profile
          setProfile(data)
        }
      }
      fetchProfile()
    }
  }, [id])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      {profile ? <ProfileForm profile={profile} /> : <p>Loading...</p>}
    </div>
  )
}
