'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Table, Space, Popconfirm, message, Card, Typography, Tag, Tooltip, Modal, Input, Spin, Empty } from 'antd'
import Link from 'next/link'
import { Subscription, Node } from '@/types'
import { EditOutlined, DeleteOutlined, PlusOutlined, SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, ImportOutlined } from '@ant-design/icons'
import type { TableProps } from 'antd';
import { parseNodeLink } from '@/lib/node-parser';

const { Title } = Typography;
const { TextArea } = Input;

interface SubscriptionStatus {
  status: 'success' | 'error' | 'updating';
  nodeCount?: number;
  lastUpdated?: string;
  error?: string;
}

type ParsedNode = Partial<Node>; 

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [statuses, setStatuses] = useState<Record<string, SubscriptionStatus>>({})
  const [loading, setLoading] = useState(true)
  const [updatingAll, setUpdatingAll] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [previewNodes, setPreviewNodes] = useState<ParsedNode[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewSubName, setPreviewSubName] = useState('');
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [importUrls, setImportUrls] = useState('');
  const [importing, setImporting] = useState(false);

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
      message.error('加载订阅列表或状态失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ... (所有 handle 函數保持不變)
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
        const parsed = (data.nodes || []).map(link => parseNodeLink(link)).filter(Boolean) as ParsedNode[];
        setPreviewNodes(parsed);
    } catch (error) {
        if(error instanceof Error) message.error(error.message);
        setPreviewNodes([]);
    } finally {
        setPreviewLoading(false);
    }
  }
  const handleBatchImport = async () => {
    setImporting(true);
    try {
      const res = await fetch('/api/subscriptions/batch-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: importUrls }),
      });
      const result = (await res.json()) as { message: string };
      if (!res.ok) {
        throw new Error(result.message || '导入失败');
      }
      message.success(result.message);
      setIsImportModalVisible(false);
      setImportUrls('');
      fetchData();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('导入订阅失败');
      }
    } finally {
      setImporting(false);
    }
  };
  const formatTime = (isoString?: string) => {
    if (!isoString) return '从未';
    try {
      return new Date(isoString).toLocaleString();
    } catch (e) {
      return '无效日期';
    }
  }
  const previewColumns: TableProps<ParsedNode>['columns'] = [
    { title: '节点名称', dataIndex: 'name', key: 'name' },
    { title: '服务器', dataIndex: 'server', key: 'server' },
    { title: '端口', dataIndex: 'port', key: 'port' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (type) => <Tag>{type}</Tag> },
  ];
  const columns: TableProps<Subscription>['columns'] = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '节点数', key: 'nodeCount', render: (_, record) => statuses[record.id]?.nodeCount ?? 'N/A' },
    { title: '最后更新', key: 'lastUpdated', render: (_, record) => {
            const status = statuses[record.id];
            if (!status) return 'N/A';
            if (status.status === 'error') {
                return <Tooltip title={status.error}><Tag icon={<CloseCircleOutlined />} color="error">更新失败</Tag></Tooltip>
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
          <Button icon={<SyncOutlined />} onClick={() => handleUpdate(record.id)} loading={statuses[record.id]?.status === 'updating'}>更新</Button>
          <Link href={`/subscriptions/${record.id}`}><Button icon={<EditOutlined />}>编辑</Button></Link>
          <Popconfirm title="确定要删除这个订阅吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
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
                    <Button type="default" icon={<SyncOutlined />} onClick={handleUpdateAll} loading={updatingAll}>全部更新</Button>
                    <Button type="default" icon={<ImportOutlined />} onClick={() => setIsImportModalVisible(true)}>导入订阅</Button>
                    <Link href="/subscriptions/new"><Button type="primary" icon={<PlusOutlined />}>添加订阅</Button></Link>
                </Space>
            </div>
            <Table 
                columns={columns} 
                dataSource={subscriptions} 
                rowKey="id" 
                loading={loading}
                locale={{ emptyText: (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={<span>暂无订阅，快去添加一个吧！</span>}
                    >
                        <Space>
                            <Link href="/subscriptions/new"><Button type="primary" icon={<PlusOutlined />}>手动添加</Button></Link>
                            <Button icon={<ImportOutlined />} onClick={() => setIsImportModalVisible(true)}>从剪贴板导入</Button>
                        </Space>
                    </Empty>
                )}}
            />
        </Card>
        {/* ... (Modals 保持不變) ... */}
        <Modal title={`预览订阅: ${previewSubName}`} open={isPreviewModalVisible} onCancel={() => setIsPreviewModalVisible(false)} footer={null} width="60%">
            <Spin spinning={previewLoading}>
                <Table size="small" columns={previewColumns} dataSource={previewNodes} rowKey={(record, index) => `${record.server}-${index}`} pagination={{ pageSize: 10 }}/>
            </Spin>
        </Modal>
        <Modal title="从剪贴板导入订阅" open={isImportModalVisible} onOk={handleBatchImport} onCancel={() => setIsImportModalVisible(false)} confirmLoading={importing} okText="导入" cancelText="取消">
            <p>请粘贴一个或多个订阅链接，每行一个。</p>
            <TextArea rows={10} value={importUrls} onChange={(e) => setImportUrls(e.target.value)} placeholder="https://example.com/sub1&#10;https://example.com/sub2"/>
      </Modal>
    </>
  )
}