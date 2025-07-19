'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Table, Space, Popconfirm, message, Tooltip, Input, Card, Typography } from 'antd'
import Link from 'next/link'
import { Profile } from '@/types'
import { EditOutlined, DeleteOutlined, PlusOutlined, CopyOutlined } from '@ant-design/icons'
import type { TableProps } from 'antd';

const { Title } = Typography;

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  // *** 这是关键的修复 1: 将 origin 存在顶层 state 中 ***
  const [origin, setOrigin] = useState('');

  // *** 关键修复 2: 在顶层 useEffect 中获取 origin ***
  useEffect(() => {
    // 确保只在客户端执行
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/profiles')
      const data = (await res.json()) as Profile[]
      setProfiles(data)
    } catch (error) {
      console.error('Failed to fetch profiles:', error)
      message.error('加载配置文件列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/profiles/${id}`, { method: 'DELETE' })
      message.success('配置文件删除成功')
      fetchProfiles()
    } catch (error) {
      console.error('Failed to delete profile:', error)
      message.error('删除配置文件失败')
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    message.success('订阅链接已复制到剪贴板')
  }

  const columns: TableProps<Profile>['columns'] = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    {
      title: '订阅链接',
      key: 'subscribe_url',
      // *** 关键修复 3: render 函数现在是一个纯粹的渲染函数，不再调用 hooks ***
      render: (_, record) => {
        const subscribeUrl = `${origin}/api/subscribe/${record.id}`;
        return (
          <Space.Compact style={{ width: '100%' }}>
            <Input readOnly value={subscribeUrl} />
            <Tooltip title="复制链接">
              <Button icon={<CopyOutlined />} onClick={() => handleCopy(subscribeUrl)} disabled={!origin} />
            </Tooltip>
          </Space.Compact>
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
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
    <Card>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>配置文件管理</Title>
        <Link href="/profiles/new">
          <Button type="primary" icon={<PlusOutlined />}>
            添加配置文件
          </Button>
        </Link>
      </div>
      <Table columns={columns} dataSource={profiles} rowKey="id" loading={loading} />
    </Card>
  )
}