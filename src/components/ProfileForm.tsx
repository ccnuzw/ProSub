'use client'

import { useState, useEffect, useMemo } from 'react'
import { Form, Input, Button, message, Spin, Card, Transfer, Typography, Tag } from 'antd'
import { useRouter } from 'next/navigation'
import { Profile, Node, Subscription, HealthStatus } from '@/types' // 导入 HealthStatus
import type { TransferDirection } from 'antd/es/transfer';

const { Title, Text } = Typography;

interface RecordType {
    key: string;
    title: string;
    description: string;
    type?: string;
    status?: HealthStatus; // 新增：用于存储节点状态
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [form] = Form.useForm()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  const [allNodes, setAllNodes] = useState<Node[]>([])
  const [allSubscriptions, setAllSubscriptions] = useState<Subscription[]>([])
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, HealthStatus>>({}) // 新增 state

  const [targetNodeKeys, setTargetNodeKeys] = useState<string[]>(profile?.nodes || []);
  const [targetSubKeys, setTargetSubKeys] = useState<string[]>(profile?.subscriptions || []);

  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true)
      try {
        // *** 这是关键的修改 1: 同时获取节点状态 ***
        const [nodesRes, subsRes, statusesRes] = await Promise.all([
          fetch('/api/nodes'),
          fetch('/api/subscriptions'),
          fetch('/api/node-statuses'),
        ])
        setAllNodes(await nodesRes.json())
        setAllSubscriptions(await subsRes.json())
        setNodeStatuses(await statusesRes.json())
      } catch (error) {
        console.error('Failed to fetch data:', error)
        message.error('加载节点、订阅或状态数据失败')
      } finally {
        setDataLoading(false)
      }
    }
    fetchData()
  }, [])

  const onFinish = async (values: { name: string }) => {
    setLoading(true)
    const method = profile ? 'PUT' : 'POST'
    const url = profile ? `/api/profiles/${profile.id}` : '/api/profiles'

    const dataToSend = {
        name: values.name,
        nodes: targetNodeKeys,
        subscriptions: targetSubKeys
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      })

      if (res.ok) {
        message.success(profile ? '配置文件更新成功' : '配置文件创建成功')
        router.push('/profiles')
        router.refresh()
      } else {
        throw new Error('操作失败')
      }
    } catch (error) {
      console.error('Profile operation failed:', error)
      message.error('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }
  
  // *** 这是关键的修改 2: 创建排序后的节点数据源 ***
  const sortedNodeData = useMemo(() => {
    const statusOrder: Record<string, number> = { 'online': 1, 'checking': 2, 'unknown': 3, 'offline': 4 };
    
    const mappedNodes: RecordType[] = allNodes.map(node => ({
        key: node.id,
        title: node.name,
        description: `${node.server}:${node.port}`,
        type: node.type,
        status: nodeStatuses[node.id] || { status: 'unknown', timestamp: '' },
    }));

    return mappedNodes.sort((a, b) => {
      const statusA = a.status!;
      const statusB = b.status!;
      const orderA = statusOrder[statusA.status] || 99;
      const orderB = statusOrder[statusB.status] || 99;
      
      if (orderA !== orderB) return orderA - orderB;
      
      if (statusA.status === 'online' && statusB.status === 'online') {
        const latencyA = statusA.latency ?? Infinity;
        const latencyB = statusB.latency ?? Infinity;
        if (latencyA !== latencyB) return latencyA - latencyB;
      }
      
      return a.title.localeCompare(b.title);
    });
  }, [allNodes, nodeStatuses]);


  if (dataLoading) {
    return <Spin tip="加载中..."></Spin>
  }

  const subData: RecordType[] = allSubscriptions.map(sub => ({
      key: sub.id,
      title: sub.name,
      description: sub.url,
  }));

  const handleNodeChange = (newTargetKeys: string[]) => {
    setTargetNodeKeys(newTargetKeys);
  };
  
  const handleSubChange = (newTargetKeys: string[]) => {
    setTargetSubKeys(newTargetKeys);
  };
  
  // *** 这是关键的修改 3: 定义新的渲染函数 ***
  const renderNodeItem = (item: RecordType) => {
    let statusTag = <Tag>未知</Tag>;
    if (item.status) {
        if (item.status.status === 'offline') {
            statusTag = <Tag color="error">离线</Tag>;
        } else if (item.status.status === 'online') {
            const latency = item.status.latency;
            let color = 'success';
            if (latency && latency > 500) color = 'warning';
            if (latency && latency > 1000) color = 'error';
            statusTag = <Tag color={color}>{latency ? `${latency}ms` : '在线'}</Tag>;
        }
    }

    return (
      <span style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <span>{item.title}</span>
        <span>
            <Tag>{item.type}</Tag>
            {statusTag}
        </span>
      </span>
    );
  };


  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={profile}
    >
      <Form.Item
        name="name"
        label={<Title level={5}>配置文件名称</Title>}
        rules={[{ required: true, message: '请输入配置文件名称' }]}
      >
        <Input placeholder="例如：主力配置" />
      </Form.Item>

      <Card title="选择节点" style={{ marginBottom: 24 }}>
        <Text type="secondary">从左侧选择你需要手动添加的节点，移到右侧。列表已按状态和延迟自动排序。</Text>
        <Transfer
            dataSource={sortedNodeData} // 使用排序后的数据
            targetKeys={targetNodeKeys}
            onChange={handleNodeChange}
            render={renderNodeItem} // 使用新的渲染函数
            listStyle={{ width: '100%', height: 300 }}
            showSearch
            showSelectAll 
            pagination
        />
      </Card>

      <Card title="选择订阅">
        <Text type="secondary">从左侧选择你需要聚合的订阅链接，移到右侧。</Text>
        <Transfer
            dataSource={subData}
            targetKeys={targetSubKeys}
            onChange={handleSubChange}
            render={item => item.title}
            listStyle={{ width: '100%', height: 300 }}
            showSearch
            showSelectAll
            pagination
        />
      </Card>

      <Form.Item style={{ marginTop: 24 }}>
        <Button type="primary" htmlType="submit" loading={loading} size="large">
          {profile ? '更新配置文件' : '创建配置文件'}
        </Button>
      </Form.Item>
    </Form>
  )
}