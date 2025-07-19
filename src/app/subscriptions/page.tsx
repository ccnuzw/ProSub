'use client'

import { useState, useEffect, useCallback } from 'react'
// *** 这是关键的修复: 在这里导入 Spin 组件 ***
import { Button, Table, Space, Popconfirm, message, Card, Typography, Tag, Tooltip, Modal, Input, Spin } from 'antd'
import Link from 'next/link'
import { Subscription } from '@/types'
import { EditOutlined, DeleteOutlined, PlusOutlined, SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons'
import type { TableProps } from 'antd';

const { Title } = Typography;
const { TextArea } = Input;

interface SubscriptionStatus {
  status: 'success' | 'error' | 'updating';
  nodeCount?: number;
  lastUpdated?: string;
  error?: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [statuses, setStatuses] = useState<Record<string, SubscriptionStatus>>({})
  const [loading, setLoading] = useState(true)
  const [updatingAll, setUpdatingAll] = useState(false);

  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [previewNodes, setPreviewNodes] = useState<string[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewSubName, setPreviewSubName] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [subsRes, statusesRes] = await Promise.all([
        fetch('/api/subscriptions'),
        fetch('/api/subscription-statuses')
      ]);
      const subsData = (await subsRes.json()) as Subscription[]
      const statusesData = (await statusesRes.json()) as Record<string, SubscriptionStatus>
      
      setSubscriptions(subsData)
      setStatuses(statusesData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      message.error('加载订阅列表或状态失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleUpdate = async (id: string) => {
    setStatuses(prev => ({ ...prev, [id]: { status: 'updating' } }));
    try {
      const res = await fetch(`/api/subscriptions/update/${id}`, { method: 'POST' });
      const data = await res.json() as SubscriptionStatus & { error?: string };
      if (!res.ok) throw new Error(data.error || '更新失败');
      setStatuses(prev => ({ ...prev, [id]: data }));
      message.success(`订阅 "${subscriptions.find(s=>s.id===id)?.name}" 更新成功!`);
    } catch (error) {
      if(error instanceof Error) message.error(error.message);
      fetchData();
    }
  }

  const handleUpdateAll = async () => {
    setUpdatingAll(true);
    await Promise.allSettled(subscriptions.map(sub => handleUpdate(sub.id)));
    setUpdatingAll(false);
    message.success('所有订阅已更新完毕');
    fetchData();
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' })
      message.success('订阅删除成功')
      fetchData()
    } catch (error) {
      console.error('Failed to delete subscription:', error)
      message.error('删除订阅失败')
    }
  }

  const handlePreview = async (sub: Subscription) => {
    setIsPreviewModalVisible(true);
    setPreviewLoading(true);
    setPreviewSubName(sub.name);
    try {
        const res = await fetch(`/api/subscriptions/preview/${sub.id}`);
        const data = (await res.json()) as { nodes?: string[], error?: string };
        if(!res.ok) throw new Error(data.error || '预览失败');
        setPreviewNodes(data.nodes || []);
    } catch (error) {
        if(error instanceof Error) message.error(error.message);
        setPreviewNodes(['加载失败']);
    } finally {
        setPreviewLoading(false);
    }
  }
  
  const formatTime = (isoString?: string) => {
    if (!isoString) return '从未';
    try {
      return new Date(isoString).toLocaleString();
    } catch (e) {
      return '无效日期';
    }
  }

  const columns: TableProps<Subscription>['columns'] = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { 
        title: '节点数', 
        key: 'nodeCount',
        render: (_, record) => statuses[record.id]?.nodeCount ?? 'N/A'
    },
    { 
        title: '最后更新', 
        key: 'lastUpdated',
        render: (_, record) => {
            const status = statuses[record.id];
            if (!status) return 'N/A';
            if (status.status === 'error') {
                return (
                    <Tooltip title={status.error}>
                        <Tag icon={<CloseCircleOutlined />} color="error">更新失败</Tag>
                    </Tooltip>
                )
            }
            return formatTime(status.lastUpdated);
        }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => handlePreview(record)}>预览</Button>
          <Button 
            icon={<SyncOutlined />} 
            onClick={() => handleUpdate(record.id)}
            loading={statuses[record.id]?.status === 'updating'}
          >
            更新
          </Button>
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
    <>
        <Card>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={3} style={{ margin: 0 }}>订阅管理</Title>
                <Space>
                    <Button 
                        type="default" 
                        icon={<SyncOutlined />} 
                        onClick={handleUpdateAll}
                        loading={updatingAll}
                    >
                        全部更新
                    </Button>
                    <Link href="/subscriptions/new">
                        <Button type="primary" icon={<PlusOutlined />}>
                            添加订阅
                        </Button>
                    </Link>
                </Space>
            </div>
            <Table columns={columns} dataSource={subscriptions} rowKey="id" loading={loading} />
        </Card>

        <Modal
            title={`预览订阅: ${previewSubName}`}
            open={isPreviewModalVisible}
            onCancel={() => setIsPreviewModalVisible(false)}
            footer={null}
            width="60%"
        >
            <Spin spinning={previewLoading}>
                <TextArea
                    readOnly
                    rows={15}
                    value={previewNodes.join('\n')}
                    style={{ background: '#f5f5f5', border: 'none', cursor: 'text' }}
                />
            </Spin>
        </Modal>
    </>
  )
}