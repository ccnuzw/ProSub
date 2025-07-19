'use client'
export const runtime = 'edge';

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Profile } from '@/types'
import { Card, Button, Spin } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// 動態導入 ProfileForm 組件
const ProfileForm = dynamic(() => import('@/components/ProfileForm'), { 
    loading: () => <Spin tip="正在加载表单..." />,
    ssr: false 
});

export default function EditProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true);
  const params = useParams()
  const { id } = params

  useEffect(() => {
    if (id) {
      const fetchProfile = async () => {
        setLoading(true);
        const res = await fetch(`/api/profiles/${id}`)
        if (res.ok) {
          const data = (await res.json()) as Profile
          setProfile(data)
        }
        setLoading(false);
      }
      fetchProfile()
    }
  }, [id])

  return (
    <Card
      title="编辑配置文件"
      extra={
        <Link href="/profiles">
          <Button icon={<ArrowLeftOutlined />}>返回列表</Button>
        </Link>
      }
    >
      {loading ? <Spin /> : (profile ? <ProfileForm profile={profile} /> : <p>加载失败或配置文件不存在。</p>)}
    </Card>
  )
}