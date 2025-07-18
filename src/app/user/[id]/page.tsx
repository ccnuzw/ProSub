
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import UserForm from '@/components/UserForm'
import { User } from '@/types'
import { message, Spin } from 'antd'

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
          console.error('Failed to fetch user:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchUser()
    }
  }, [id])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Spin size="large" tip="加载中..."></Spin>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">编辑用户</h1>
      {user ? <UserForm user={user} /> : <p>用户数据加载失败或不存在。</p>}
    </div>
  )
}
