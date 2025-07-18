
'use client'

import { useState, useEffect } from 'react'
import { Button, Card, message, Spin } from 'antd'
import { useRouter } from 'next/navigation'
import { User } from '@/types'

export default function UserProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true)
      try {
        // Fetch current user info (assuming an API endpoint for current user)
        // For simplicity, we'll try to get user from /api/users/[id] using the token's ID
        const res = await fetch('/api/auth/me') // We need to create this endpoint
        if (res.ok) {
          const data = await res.json()
          setUser(data)
        } else if (res.status === 401) {
          message.warning('请先登录')
          router.push('/user/login')
        } else {
          throw new Error('获取用户信息失败')
        }
      } catch (error) {
        message.error('加载用户资料失败')
        console.error('Failed to fetch user profile:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUserProfile()
  }, [router])

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        message.success('登出成功')
        router.push('/user/login')
      } else {
        throw new Error('登出失败')
      }
    } catch (error) {
      message.error('登出失败，请重试')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Spin size="large" tip="加载中..."></Spin>
      </div>
    )
  }

  if (!user) {
    return <p>无法加载用户资料。</p>
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <Card title="用户资料">
        <p><strong>用户名:</strong> {user.name}</p>
        <p><strong>用户ID:</strong> {user.id}</p>
        <p><strong>关联配置文件数量:</strong> {user.profiles.length}</p>
        <Button type="primary" danger onClick={handleLogout} style={{ marginTop: '20px' }}>
          登出
        </Button>
      </Card>
    </div>
  )
}
