
'use client'

import { useState, useEffect } from 'react'
import { Button, Table, Space, Popconfirm, message, Switch } from 'antd'
import Link from 'next/link'
import { User } from '@/types'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [registrationEnabled, setRegistrationEnabled] = useState(false)
  const [configLoading, setConfigLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null) // New state for current user
  const [currentUserLoading, setCurrentUserLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      message.error('加载用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchRegistrationStatus = async () => {
    setConfigLoading(true)
    try {
      const res = await fetch('/api/config/registration-enabled')
      const data = await res.json()
      setRegistrationEnabled(data.enabled)
    } catch (error) {
      message.error('加载注册状态失败')
    } finally {
      setConfigLoading(false)
    }
  }

  const fetchCurrentUser = async () => {
    setCurrentUserLoading(true)
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const user = await res.json()
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
    fetchRegistrationStatus()
    fetchCurrentUser()
  }, [])

  const handleRegistrationToggle = async (checked: boolean) => {
    try {
      const res = await fetch('/api/config/registration-enabled', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: checked }),
      })
      if (res.ok) {
        message.success(`注册功能已${checked ? '开启' : '关闭'}`)
        setRegistrationEnabled(checked)
      } else {
        const errorData = await res.json()
        message.error(errorData.message || '更新注册状态失败')
      }
    } catch (error) {
      message.error('网络错误，更新注册状态失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' })
      message.success('用户删除成功')
      fetchUsers()
    } catch (error) {
      message.error('删除用户失败')
    }
  }

  const columns = [
    { title: '用户名', dataIndex: 'name', key: 'name' },
    { title: '关联配置文件数量', dataIndex: 'profiles', key: 'profiles', render: (profiles: string[]) => profiles.length },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
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
          {!configLoading && !currentUserLoading && currentUser?.name === 'admin' && (
            <Switch
              checkedChildren="注册开启"
              unCheckedChildren="注册关闭"
              checked={registrationEnabled}
              onChange={handleRegistrationToggle}
              loading={configLoading}
            />
          )}
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
