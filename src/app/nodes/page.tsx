'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Table, Space, Popconfirm, message, Tag, Modal, Input } from 'antd'
import Link from 'next/link'
import { Node, HealthStatus } from '@/types'
import { EditOutlined, DeleteOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, ReloadOutlined, ImportOutlined } from '@ant-design/icons'
import type { TableProps } from 'antd';

const { TextArea } = Input;

export default function NodesPage() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [nodeStatus, setNodeStatus] = useState<Record<string, HealthStatus>>({})
  const [checkingAll, setCheckingAll] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [importLinks, setImportLinks] = useState('');
  const [importing, setImporting] = useState(false);

  const fetchNodesAndStatuses = useCallback(async () => {
    setLoading(true)
    try {
      const [nodesRes, statusesRes] = await Promise.all([
        fetch('/api/nodes'),
        fetch('/api/node-statuses'),
      ])
      const nodesData = (await nodesRes.json()) as Node[]
      const statusesData = (await statusesRes.json()) as Record<string, HealthStatus>

      setNodes(nodesData)
      setNodeStatus(statusesData)
    } catch (error) {
      console.error('Failed to fetch nodes or statuses:', error)
      message.error('加载节点列表或状态失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNodesAndStatuses()
  }, [fetchNodesAndStatuses])

  const checkNodeHealth = async (node: Node) => {
    setNodeStatus(prev => ({ ...prev, [node.id]: { status: 'checking', timestamp: new Date().toISOString() } }))
    try {
      const res = await fetch(`/api/node-health-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server: node.server, port: node.port, nodeId: node.id })
      });
      const data = (await res.json()) as HealthStatus;
      setNodeStatus(prev => ({ ...prev, [node.id]: data }))
    } catch (error) {
      console.error('Failed to check node health:', error)
      setNodeStatus(prev => ({ ...prev, [node.id]: { status: 'offline', timestamp: new Date().toISOString() } }))
    }
  }
  
  const handleCheckAllNodes = async () => {
    setCheckingAll(true)
    // 使用 Promise.allSettled 来确保即使部分节点检查失败，也不会中断整个流程
    await Promise.allSettled(nodes.map(node => checkNodeHealth(node)))
    setCheckingAll(false)
    message.success('所有节点健康检查完成')
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/nodes/${id}`, { method: 'DELETE' })
      message.success('节点删除成功')
      fetchNodesAndStatuses()
    } catch (error) {
      console.error('Failed to delete node:', error)
      message.error('删除节点失败')
    }
  }

  const handleBatchDelete = async () => {
    try {
      await fetch(`/api/nodes/batch-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedRowKeys }),
      });
      message.success(`成功删除 ${selectedRowKeys.length} 个节点`);
      setSelectedRowKeys([]);
      fetchNodesAndStatuses();
    } catch (error) {
      console.error('Failed to batch delete nodes:', error);
      message.error('批量删除失败');
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await fetch('/api/nodes/batch-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: importLinks }),
      });
      const result = (await res.json()) as { message: string };
      if (!res.ok) {
        throw new Error(result.message || '导入失败');
      }
      message.success(result.message);
      setIsImportModalVisible(false);
      setImportLinks('');
      fetchNodesAndStatuses();
    } catch (error) {
        if(error instanceof Error) {
            message.error(error.message);
        } else {
            message.error('导入节点失败');
        }
    } finally {
      setImporting(false);
    }
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const hasSelected = selectedRowKeys.length > 0;

  const columns: TableProps<Node>['columns'] = [
    { title: '名称', dataIndex: 'name', key: 'name', width: '25%' },
    { title: '类型', dataIndex: 'type', key: 'type', width: '10%' },
    { title: '服务器', dataIndex: 'server', key: 'server', width: '25%' },
    { title: '端口', dataIndex: 'port', key: 'port', width: '10%' },
    {
      title: '状态',
      key: 'status',
      width: '15%',
      render: (_, record) => {
        const statusInfo = nodeStatus[record.id]
        if (!statusInfo) return <Tag>未知</Tag>
        if (statusInfo.status === 'checking') return <Tag icon={<SyncOutlined spin />} color="processing">检查中...</Tag>
        if (statusInfo.status === 'offline') return <Tag icon={<CloseCircleOutlined />} color="error">离线</Tag>
        
        // *** 这是关键的修改 ***
        if (statusInfo.status === 'online') {
            const latency = statusInfo.latency;
            let color = 'success';
            if(latency && latency > 500) color = 'warning';
            if(latency && latency > 1000) color = 'error';
            return <Tag icon={<CheckCircleOutlined />} color={color}>{latency ? `${latency} ms` : '在线'}</Tag>
        }
        return <Tag>未知</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<ReloadOutlined />} onClick={() => checkNodeHealth(record)} loading={nodeStatus[record.id]?.status === 'checking'}>检查</Button>
          <Link href={`/nodes/${record.id}`}>
            <Button icon={<EditOutlined />}>编辑</Button>
          </Link>
          <Popconfirm
            title="确定要删除这个节点吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button icon={<DeleteOutlined />} danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>节点管理</h1>
        <Space>
          <Button type="default" icon={<ReloadOutlined />} onClick={handleCheckAllNodes} loading={checkingAll}>
            检查所有节点
          </Button>
          <Button type="default" icon={<ImportOutlined />} onClick={() => setIsImportModalVisible(true)}>
            导入节点
          </Button>
          <Link href="/nodes/new">
            <Button type="primary" icon={<PlusOutlined />}>
              添加节点
            </Button>
          </Link>
        </Space>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Popconfirm
            title={`确定要删除选中的 ${selectedRowKeys.length} 个节点吗？`}
            onConfirm={handleBatchDelete}
            okText="确定"
            cancelText="取消"
            disabled={!hasSelected}
        >
            <Button type="primary" danger disabled={!hasSelected}>
                删除选中
            </Button>
        </Popconfirm>
        <span style={{ marginLeft: 8 }}>
          {hasSelected ? `已选择 ${selectedRowKeys.length} 项` : ''}
        </span>
      </div>

      <Table 
        rowSelection={rowSelection} 
        columns={columns} 
        dataSource={nodes} 
        rowKey="id" 
        loading={loading} 
      />

      <Modal
        title="从剪贴板导入节点"
        open={isImportModalVisible}
        onOk={handleImport}
        onCancel={() => setIsImportModalVisible(false)}
        confirmLoading={importing}
        okText="导入"
        cancelText="取消"
      >
        <p>请粘贴一个或多个节点链接，每行一个。</p>
        <TextArea
          rows={10}
          value={importLinks}
          onChange={(e) => setImportLinks(e.target.value)}
          placeholder="vmess://...&#10;vless://...&#10;ss://..."
        />
      </Modal>
    </div>
  )
}