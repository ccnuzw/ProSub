
'use client'

import { useState, useEffect } from 'react'
import { Button, Table, Space, Popconfirm, message } from 'antd'
import Link from 'next/link'
import { User } from '@/types'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null) // New state for current user
  const [currentUserLoading, setCurrentUserLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      const data = (await res.json()) as User[]
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      message.error('加载用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentUser = async () => {
    setCurrentUserLoading(true)
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const user = (await res.json()) as User
        setCurrentUser(user)
      } else {
        setCurrentUser(null)
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error)
      setCurrentUser(null)
    } finally {
      setCurrentUserLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchCurrentUser()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' })
      message.success('用户删除成功')
      fetchUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
      message.error('删除用户失败')
    }
  }

  const columns = [
    { title: '用户名', dataIndex: 'name', key: 'name' },
    { title: '关联配置文件数量', dataIndex: 'profiles', key: 'profiles', render: (profiles: string[]) => profiles.length },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: User) => (
        <Space size="middle">
          <Link href={`/user/${record.id}`}>
            <Button icon={<EditOutlined />}>编辑</Button>
          </Link>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button icon={<DeleteOutlined />} danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>用户管理</h1>
        <Space>
          <Link href="/user/new">
            <Button type="primary" icon={<PlusOutlined />}>
              添加用户
            </Button>
          </Link>
        </Space>
      </div>
      <Table columns={columns} dataSource={users} rowKey="id" loading={loading} />
    </div>
  )
}
