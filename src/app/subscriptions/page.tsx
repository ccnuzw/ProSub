'use client'

import { useState, useEffect } from 'react'
import { Button, Table, Space, Popconfirm, message } from 'antd'
import Link from 'next/link'
import { Subscription } from '@/types'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSubscriptions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/subscriptions')
      const data = await res.json()
      setSubscriptions(data)
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
      message.error('加载订阅列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' })
      message.success('订阅删除成功')
      fetchSubscriptions()
    } catch (error) {
      console.error('Failed to delete subscription:', error)
      message.error('删除订阅失败')
    }
  }

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: 'URL', dataIndex: 'url', key: 'url', render: (url: string) => <a href={url} target="_blank" rel="noopener noreferrer">{url}</a> },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Subscription) => (
        <Space size="middle">
          <Link href={`/subscriptions/${record.id}`}>
            <Button icon={<EditOutlined />}>编辑</Button>
          </Link>
          <Popconfirm
            title="确定要删除这个订阅吗？"
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
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>订阅管理</h1>
        <Link href="/subscriptions/new">
          <Button type="primary" icon={<PlusOutlined />}>
            添加订阅
          </Button>
        </Link>
      </div>
      <Table columns={columns} dataSource={subscriptions} rowKey="id" loading={loading} />
    </div>
  )
}