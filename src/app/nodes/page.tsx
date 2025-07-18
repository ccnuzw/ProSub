'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Table, Space, Popconfirm, message, Tag } from 'antd'
import Link from 'next/link'
import { Node } from '@/types'
import { EditOutlined, DeleteOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, ReloadOutlined } from '@ant-design/icons'

export default function NodesPage() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [nodeStatus, setNodeStatus] = useState<Record<string, { status: 'online' | 'offline' | 'checking', timestamp: string }>>({}) // Updated state for node status
  const [checkingAll, setCheckingAll] = useState(false)

  const fetchNodesAndStatuses = useCallback(async () => {
    setLoading(true)
    try {
      const [nodesRes, statusesRes] = await Promise.all([
        fetch('/api/nodes'),
        fetch('/api/node-statuses'),
      ])
      const nodesData = await nodesRes.json()
      const statusesData = await statusesRes.json()

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
      const res = await fetch(`/api/node-health-check?server=${node.server}&port=${node.port}&nodeId=${node.id}`)
      const data = await res.json()
      setNodeStatus(prev => ({ ...prev, [node.id]: data }))
    } catch (error) {
      console.error('Failed to check node health:', error)
      setNodeStatus(prev => ({ ...prev, [node.id]: { status: 'offline', timestamp: new Date().toISOString() } }))
    }
  }

  const handleCheckAllNodes = async () => {
    setCheckingAll(true)
    const checkPromises = nodes.map(node => checkNodeHealth(node))
    await Promise.all(checkPromises)
    setCheckingAll(false)
    message.success('所有节点健康检查完成')
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/nodes/${id}`, { method: 'DELETE' })
      message.success('节点删除成功')
      fetchNodesAndStatuses() // Re-fetch the list and statuses
    } catch (error) {
      console.error('Failed to delete node:', error)
      message.error('删除节点失败')
    }
  }

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '服务器', dataIndex: 'server', key: 'server' },
    { title: '端口', dataIndex: 'port', key: 'port' },
    {
      title: '状态',
      key: 'status',
      render: (_: unknown, record: Node) => {
        const statusInfo = nodeStatus[record.id]
        if (!statusInfo) {
          return <Tag>未知</Tag>
        }
        if (statusInfo.status === 'online') {
          return <Tag icon={<CheckCircleOutlined />} color="success">在线</Tag>
        } else if (statusInfo.status === 'offline') {
          return <Tag icon={<CloseCircleOutlined />} color="error">离线</Tag>
        } else if (statusInfo.status === 'checking') {
          return <Tag icon={<SyncOutlined spin />} color="processing">检查中...</Tag>
        } else {
          return <Tag>未知</Tag>
        }
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Node) => (
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
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>节点管理</h1>
        <Space>
          <Button type="default" icon={<ReloadOutlined />} onClick={handleCheckAllNodes} loading={checkingAll}>
            检查所有节点
          </Button>
          <Link href="/nodes/new">
            <Button type="primary" icon={<PlusOutlined />}>
              添加节点
            </Button>
          </Link>
        </Space>
      </div>
      <Table columns={columns} dataSource={nodes} rowKey="id" loading={loading} />
    </div>
  )
}