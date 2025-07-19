'use client'
export const runtime = 'edge';

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ProfileForm from '@/components/ProfileForm'
import { Profile } from '@/types'
import { Card, Button, Spin } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Link from 'next/link'

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