'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Table, Space, Popconfirm, message, Tooltip, Input, Card, Typography } from 'antd'
import Link from 'next/link'
import { Profile } from '@/types'
import { EditOutlined, DeleteOutlined, PlusOutlined, CopyOutlined, ClusterOutlined, WifiOutlined } from '@ant-design/icons'
import type { TableProps } from 'antd';

const { Title } = Typography;

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState('');

  useEffect(() => {
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
    // *** 这是关键的修改 1: 新增列来显示数量 ***
    { 
      title: '节点数', 
      dataIndex: 'nodes', 
      key: 'nodes', 
      render: (nodes: string[]) => <Space><ClusterOutlined /> {nodes?.length || 0}</Space> 
    },
    { 
      title: '订阅数', 
      dataIndex: 'subscriptions', 
      key: 'subscriptions', 
      render: (subscriptions: string[]) => <Space><WifiOutlined /> {subscriptions?.length || 0}</Space>
    },
    {
      title: '订阅链接',
      key: 'subscribe_url',
      render: (text: string, record: Profile) => {
        const subUrl = record.alias 
          ? `${window.location.origin}/sub/${record.alias}`
          : `${window.location.origin}/api/subscribe/${record.id}`;
        
        return (
          <Space>
            <Tooltip title={subUrl}>
              <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(subUrl)} />
            </Tooltip>
            <Button icon={<QrcodeOutlined />} onClick={() => showQrCode(subUrl)} />
          </Space>
        );
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