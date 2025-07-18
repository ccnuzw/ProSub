'use client'

import { useState, useEffect } from 'react'
import { Button, Table, Space, Popconfirm, message, Tooltip, Input } from 'antd'
import Link from 'next/link'
import { Profile } from '@/types'
import { EditOutlined, DeleteOutlined, PlusOutlined, LinkOutlined, CopyOutlined } from '@ant-design/icons'

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProfiles = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/profiles')
      const data = await res.json()
      setProfiles(data)
    } catch (error) {
      message.error('加载配置文件列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/profiles/${id}`, { method: 'DELETE' })
      message.success('配置文件删除成功')
      fetchProfiles()
    } catch (error) {
      message.error('删除配置文件失败')
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    message.success('订阅链接已复制到剪贴板')
  }

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    {
      title: '订阅链接',
      key: 'subscribe_url',
      render: (_: any, record: Profile) => {
        const subscribeUrl = `${window.location.origin}/api/subscribe/${record.id}`
        return (
          <Space.Compact style={{ width: '100%' }}>
            <Input readOnly value={subscribeUrl} />
            <Tooltip title="复制链接">
              <Button icon={<CopyOutlined />} onClick={() => handleCopy(subscribeUrl)} />
            </Tooltip>
          </Space.Compact>
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Profile) => (
        <Space size="middle">
          <Link href={`/profiles/${record.id}`}>
            <Button icon={<EditOutlined />}>编辑</Button>
          </Link>
          <Popconfirm
            title="确定要删除这个配置文件吗？"
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
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>配置文件管理</h1>
        <Link href="/profiles/new">
          <Button type="primary" icon={<PlusOutlined />}>
            添加配置文件
          </Button>
        </Link>
      </div>
      <Table columns={columns} dataSource={profiles} rowKey="id" loading={loading} />
    </div>
  )
}