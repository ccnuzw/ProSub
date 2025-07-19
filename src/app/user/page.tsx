'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Table, Space, Popconfirm, message, Card, Typography, Tooltip } from 'antd'
import Link from 'next/link'
import { User } from '@/types'
import { EditOutlined, DeleteOutlined, PlusOutlined, CopyOutlined } from '@ant-design/icons'
import type { TableProps } from 'antd';

const { Title } = Typography;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleDelete = async (id: string) => {
    if (id === 'admin') {
      message.error('不能删除默认的 admin 用户');
      return;
    }
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' })
      message.success('用户删除成功')
      fetchUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
      message.error('删除用户失败')
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('用户ID已复制');
  };

  const columns: TableProps<User>['columns'] = [
    { title: '用户名', dataIndex: 'name', key: 'name' },
    // *** 這是關鍵的修改：新增 User ID 列 ***
    { 
      title: '用户ID', 
      dataIndex: 'id', 
      key: 'id',
      render: (id: string) => (
        <Space>
          <span>{id.substring(0, 8)}...</span>
          <Tooltip title="复制完整ID">
            <Button shape="circle" icon={<CopyOutlined />} size="small" onClick={() => handleCopy(id)} />
          </Tooltip>
        </Space>
      )
    },
    { title: '关联配置文件数', dataIndex: 'profiles', key: 'profiles', render: (profiles: string[]) => profiles?.length || 0 },
    {
      title: '操作',
      key: 'action',
      render: (_, record: User) => (
        <Space size="middle">
          <Link href={`/user/${record.id}`}>
            <Button icon={<EditOutlined />}>编辑</Button>
          </Link>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            disabled={record.id === 'admin'}
          >
            <Button icon={<DeleteOutlined />} danger disabled={record.id === 'admin'}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>用户管理</Title>
            <Link href="/user/new">
                <Button type="primary" icon={<PlusOutlined />}>
                添加用户
                </Button>
            </Link>
        </div>
        <Table columns={columns} dataSource={users} rowKey="id" loading={loading} />
    </Card>
  )
}