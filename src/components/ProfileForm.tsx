'use client'

import { useState, useEffect, useMemo } from 'react'
import { Form, Input, Button, message, Spin, Card, Typography, List, Tag, Row, Col, Empty } from 'antd'
import { useRouter } from 'next/navigation'
import { Profile, Node, Subscription, HealthStatus } from '@/types'
import { ArrowRightOutlined, ArrowLeftOutlined, ClusterOutlined, WifiOutlined } from '@ant-design/icons'

const { Title, Text } = Typography;
const { Search } = Input;

interface ProfileFormProps {
  profile?: Profile
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [form] = Form.useForm()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  // --- 數據源 ---
  const [allNodes, setAllNodes] = useState<Node[]>([])
  const [allSubscriptions, setAllSubscriptions] = useState<Subscription[]>([])
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, HealthStatus>>({})

  // --- 已選擇項目的 State ---
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>(profile?.nodes || []);
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>(profile?.subscriptions || []);
  
  // --- 搜索 State ---
  const [nodeSearchTerm, setNodeSearchTerm] = useState('');
  const [subSearchTerm, setSubSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true)
      try {
        const [nodesRes, subsRes, statusesRes] = await Promise.all([
          fetch('/api/nodes'),
          fetch('/api/subscriptions'),
          fetch('/api/node-statuses'),
        ])
        setAllNodes(await nodesRes.json())
        setAllSubscriptions(await subsRes.json())
        setNodeStatuses(await statusesRes.json())
      } catch (error) {
        message.error('加载资源数据失败')
      } finally {
        setDataLoading(false)
      }
    }
    fetchData()
  }, [])

  // --- 提交邏輯 ---
  const onFinish = async (values: { name: string }) => {
    setLoading(true)
    const method = profile ? 'PUT' : 'POST'
    const url = profile ? `/api/profiles/${profile.id}` : '/api/profiles'
    const dataToSend = { name: values.name, nodes: selectedNodeIds, subscriptions: selectedSubIds };

    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSend) })
      if (res.ok) {
        message.success(profile ? '配置文件更新成功' : '配置文件创建成功')
        router.push('/profiles');
        router.refresh();
      } else { throw new Error('操作失败') }
    } catch (error) {
      message.error('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // --- 核心操作邏輯 ---
  const addNode = (id: string) => setSelectedNodeIds(prev => [...prev, id]);
  const removeNode = (id: string) => setSelectedNodeIds(prev => prev.filter(i => i !== id));
  const addSub = (id: string) => setSelectedSubIds(prev => [...prev, id]);
  const removeSub = (id: string) => setSelectedSubIds(prev => prev.filter(i => i !== id));

  // --- 數據計算 (可選/已選/排序) ---
  const { availableNodes, selectedNodes } = useMemo(() => {
    const statusOrder: Record<string, number> = { 'online': 1, 'checking': 2, 'unknown': 3, 'offline': 4 };
    
    const available = allNodes
      .filter(node => !selectedNodeIds.includes(node.id))
      .filter(node => node.name.toLowerCase().includes(nodeSearchTerm.toLowerCase()))
      .sort((a, b) => {
          const statusA = nodeStatuses[a.id] || { status: 'unknown' };
          const statusB = nodeStatuses[b.id] || { status: 'unknown' };
          const orderA = statusOrder[statusA.status] || 99;
          const orderB = statusOrder[statusB.status] || 99;
          if (orderA !== orderB) return orderA - orderB;
          const latencyA = statusA.latency ?? Infinity;
          const latencyB = statusB.latency ?? Infinity;
          if (latencyA !== latencyB) return latencyA - latencyB;
          return a.name.localeCompare(b.name);
      });

    const selected = allNodes.filter(node => selectedNodeIds.includes(node.id));
    return { availableNodes: available, selectedNodes: selected };
  }, [allNodes, selectedNodeIds, nodeStatuses, nodeSearchTerm]);

  const { availableSubs, selectedSubs } = useMemo(() => {
    const available = allSubscriptions
        .filter(sub => !selectedSubIds.includes(sub.id))
        .filter(sub => sub.name.toLowerCase().includes(subSearchTerm.toLowerCase()));
    const selected = allSubscriptions.filter(sub => selectedSubIds.includes(sub.id));
    return { availableSubs: available, selectedSubs: selected };
  }, [allSubscriptions, selectedSubIds, subSearchTerm]);


  if (dataLoading) return <Spin tip="加载中..." />;

  // 列表項渲染函數
  const renderNodeItem = (node: Node, action: 'add' | 'remove') => {
    const status = nodeStatuses[node.id];
    let statusTag;
    if (status) {
        if (status.status === 'offline') statusTag = <Tag color="error">离线</Tag>;
        else if (status.status === 'online') {
            const latency = status.latency;
            let color = 'success';
            if (latency && latency > 500) color = 'warning';
            if (latency && latency > 1000) color = 'error';
            statusTag = <Tag color={color}>{latency ? `${latency}ms` : '在线'}</Tag>;
        }
    }
    return (
        <List.Item
            actions={[
                <Button 
                    shape="circle" 
                    icon={action === 'add' ? <ArrowRightOutlined /> : <ArrowLeftOutlined />} 
                    onClick={() => action === 'add' ? addNode(node.id) : removeNode(node.id)}
                />
            ]}
        >
            <List.Item.Meta
                avatar={<ClusterOutlined />}
                title={node.name}
                description={<Space>{statusTag}<Tag>{node.type}</Tag></Space>}
            />
        </List.Item>
    );
  };
  
  const renderSubItem = (sub: Subscription, action: 'add' | 'remove') => (
    <List.Item
        actions={[
            <Button 
                shape="circle" 
                icon={action === 'add' ? <ArrowRightOutlined /> : <ArrowLeftOutlined />} 
                onClick={() => action === 'add' ? addSub(sub.id) : removeSub(sub.id)}
            />
        ]}
    >
        <List.Item.Meta
            avatar={<WifiOutlined />}
            title={sub.name}
            description={sub.url}
        />
    </List.Item>
  );

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} initialValues={profile}>
      <Form.Item name="name" label={<Title level={5}>配置文件名称</Title>} rules={[{ required: true, message: '请输入配置文件名称' }]}>
        <Input placeholder="例如：主力配置" />
      </Form.Item>

      <Title level={5} style={{marginTop: '24px'}}>选择节点</Title>
      <Row gutter={[16,16]}>
        <Col xs={24} md={12}>
            <Card title={`可选节点 (${availableNodes.length})`} size="small">
                <Search placeholder="搜索节点..." onChange={e => setNodeSearchTerm(e.target.value)} style={{ marginBottom: 16 }}/>
                <List
                    style={{ height: 400, overflow: 'auto' }}
                    dataSource={availableNodes}
                    renderItem={(item) => renderNodeItem(item, 'add')}
                    locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="所有节点都已选择或无可用节点" /> }}
                />
            </Card>
        </Col>
        <Col xs={24} md={12}>
            <Card title={`已选节点 (${selectedNodes.length})`} size="small">
                <List
                    style={{ height: 400, overflow: 'auto' }}
                    dataSource={selectedNodes}
                    renderItem={(item) => renderNodeItem(item, 'remove')}
                    locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请从左侧添加节点" /> }}
                />
            </Card>
        </Col>
      </Row>

      <Title level={5} style={{marginTop: '24px'}}>选择订阅</Title>
      <Row gutter={[16,16]}>
        <Col xs={24} md={12}>
            <Card title={`可选订阅 (${availableSubs.length})`} size="small">
                <Search placeholder="搜索订阅..." onChange={e => setSubSearchTerm(e.target.value)} style={{ marginBottom: 16 }}/>
                <List
                    style={{ height: 200, overflow: 'auto' }}
                    dataSource={availableSubs}
                    renderItem={(item) => renderSubItem(item, 'add')}
                    locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="所有订阅都已选择或无可用订阅" /> }}
                />
            </Card>
        </Col>
        <Col xs={24} md={12}>
            <Card title={`已选订阅 (${selectedSubs.length})`} size="small">
                <List
                    style={{ height: 200, overflow: 'auto' }}
                    dataSource={selectedSubs}
                    renderItem={(item) => renderSubItem(item, 'remove')}
                    locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请从左侧添加订阅" /> }}
                />
            </Card>
        </Col>
      </Row>

      <Form.Item style={{ marginTop: 24 }}>
        <Button type="primary" htmlType="submit" loading={loading} size="large">
          {profile ? '更新配置文件' : '创建配置文件'}
        </Button>
      </Form.Item>
    </Form>
  )
}