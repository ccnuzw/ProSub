'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Table, Space, Popconfirm, message, Tooltip, Modal, Card, Typography } from 'antd'
import Link from 'next/link'
import { Profile } from '@/types'
import { EditOutlined, DeleteOutlined, PlusOutlined, CopyOutlined, QrcodeOutlined, ClusterOutlined, WifiOutlined } from '@ant-design/icons'
import type { TableProps } from 'antd';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

const { Title } = Typography;

export default function ProfilesClientPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState('');
  const [tableColumns, setTableColumns] = useState<TableProps<Profile>['columns']>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/profiles')
      if (!res.ok) {
        throw new Error(`Failed to fetch profiles: ${res.statusText}`)
      }
      const data = await res.json()
      if (!Array.isArray(data)) {
        throw new Error('API response is not an array')
      }
      setProfiles(data as Profile[])
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

  const handleDelete = useCallback(async (id: string) => {
    try {
      await fetch(`/api/profiles/${id}`, { method: 'DELETE' })
      message.success('配置文件删除成功')
      await fetchProfiles()
    } catch (error) {
      console.error('Failed to delete profile:', error)
      message.error('删除配置文件失败')
    }
  }, [fetchProfiles])

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    message.success('订阅链接已复制到剪贴板')
  }, [])

  const showQrCode = useCallback((url: string) => {
    Modal.info({
      title: '订阅二维码',
      content: (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <QRCode value={url} size={256} />
        </div>
      ),
      okText: '关闭',
      centered: true,
    });
  }, []);

  useEffect(() => {
    const columns: TableProps<Profile>['columns'] = [
      { title: '名称', dataIndex: 'name', key: 'name' },
      { 
        title: '节点数', 
        dataIndex: 'nodes', 
        key: 'nodes', 
        render: (nodes: string[] | undefined) => <Space><ClusterOutlined /> {nodes?.length || 0}</Space> 
      },
      { 
        title: '订阅数', 
        dataIndex: 'subscriptions', 
        key: 'subscriptions', 
        render: (subscriptions: string[] | undefined) => <Space><WifiOutlined /> {subscriptions?.length || 0}</Space>
      },
      {
        title: '订阅链接',
        key: 'subscribe_url',
        render: (text: string, record: Profile) => {
          if (!origin) return null;
  
          const subUrl = record.alias 
            ? `${origin}/sub/${record.alias}`
            : `${origin}/api/subscribe/${record.id}`;
          
          return (
            <Space>
              <Tooltip title={subUrl}>
                <Button icon={<CopyOutlined />} onClick={() => handleCopy(subUrl)} />
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
    setTableColumns(columns);
  }, [origin, handleDelete, handleCopy, showQrCode, fetchProfiles])

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
      <Table columns={tableColumns} dataSource={profiles} rowKey="id" loading={loading} />
    </Card>
  )
}
