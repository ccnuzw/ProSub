'use client'
export const runtime = 'edge';

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { User } from '@/types'
import { message, Spin, Card, Button } from 'antd'
import Link from 'next/link'
import { ArrowLeftOutlined } from '@ant-design/icons'
import dynamic from 'next/dynamic'

// 動態導入 UserForm 組件
const UserForm = dynamic(() => import('@/components/UserForm'), { 
    loading: () => <Spin tip="正在加载表单..." />,
    ssr: false 
});

export default function EditUserPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const { id } = params

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        setLoading(true)
        try {
          const res = await fetch(`/api/users/${id}`)
          if (res.ok) {
            const data = (await res.json()) as User
            setUser(data)
          } else {
            throw new Error('用户不存在')
          }
        } catch (error) {
          message.error('加载用户数据失败')
        } finally {
          setLoading(false)
        }
      }
      fetchUser()
    }
  }, [id])

  return (
    <Card
      title="编辑用戶"
      extra={
        <Link href="/user">
          <Button icon={<ArrowLeftOutlined />}>返回列表</Button>
        </Link>
      }
    >
      {loading ? <Spin /> : (user ? <UserForm user={user} /> : <p>用户数据加载失败或不存在。</p>)}
    </Card>
  )
}