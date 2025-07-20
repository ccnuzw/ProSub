import dynamic from 'next/dynamic'

const ProfilesClientPage = dynamic(() => import('@/components/ProfilesClientPage'), { ssr: false })

export default function ProfilesPage() {
  return <ProfilesClientPage />
}
