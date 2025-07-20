'use client'

import { useState, useEffect, useMemo } from 'react'
import { Form, Input, Button, message, Spin, Card, Typography, List, Tag, Empty, Space, Checkbox } from 'antd'
import { useRouter } from 'next/navigation'
import { Profile, Node, Subscription, HealthStatus } from '@/types'
import { ArrowRightOutlined, ArrowLeftOutlined, ClusterOutlined, WifiOutlined } from '@ant-design/icons'
import type { CheckboxChangeEvent } from 'antd/es/checkbox';

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

  const [allNodes, setAllNodes] = useState<Node[]>([])
  const [allSubscriptions, setAllSubscriptions] = useState<Subscription[]>([])
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, HealthStatus>>({})

  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>(profile?.nodes || []);
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>(profile?.subscriptions || []);
  
  const [nodeSearchTerm, setNodeSearchTerm] = useState('');
  const [subSearchTerm, setSubSearchTerm] = useState('');
  
  const [checkedNodeIds, setCheckedNodeIds] = useState<string[]>([]);
  const [checkedSubIds, setCheckedSubIds] = useState<string[]>([]);

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

  // --- 數據計算與過濾 ---
  const { availableNodes, selectedNodes } = useMemo(() => {
    const statusOrder: Record<string, number> = { 'online': 1, 'checking': 2, 'unknown': 3, 'offline': 4 };
    
    const available = allNodes
      .filter(node => !selectedNodeIds.includes(node.id))
      // *** 這是關鍵的修改 1: 統一搜索邏輯 ***
      .filter(node => {
          const term = nodeSearchTerm.toLowerCase();
          return (
            node.name.toLowerCase().includes(term) ||
            node.server.toLowerCase().includes(term) ||
            node.type.toLowerCase().includes(term)
          );
      })
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
        .filter(sub => 
            sub.name.toLowerCase().includes(subSearchTerm.toLowerCase()) ||
            sub.url.toLowerCase().includes(subSearchTerm.toLowerCase())
        );
    const selected = allSubscriptions.filter(sub => selectedSubIds.includes(sub.id));
    return { availableSubs: available, selectedSubs: selected };
  }, [allSubscriptions, selectedSubIds, subSearchTerm]);


  // ... (批量/單個操作邏輯 和 列表項渲染函數 保持不變) ...
    const handleNodeCheckChange = (id: string, checked: boolean) => setCheckedNodeIds(prev => checked ? [...prev, id] : prev.filter(i => i !== id));
    const handleSubCheckChange = (id: string, checked: boolean) => setCheckedSubIds(prev => checked ? [...prev, id] : prev.filter(i => i !== id));
    const moveCheckedNodes = () => {
        const toMove = checkedNodeIds.filter(id => !selectedNodeIds.includes(id));
        setSelectedNodeIds(prev => [...prev, ...toMove]);
        setCheckedNodeIds([]);
    };
    const removeCheckedNodes = () => {
        const toKeep = selectedNodeIds.filter(id => !checkedNodeIds.includes(id));
        setSelectedNodeIds(toKeep);
        setCheckedNodeIds([]);
    };
    const moveCheckedSubs = () => {
        const toMove = checkedSubIds.filter(id => !selectedSubIds.includes(id));
        setSelectedSubIds(prev => [...prev, ...toMove]);
        setCheckedSubIds([]);
    };
    const removeCheckedSubs = () => {
        const toKeep = selectedSubIds.filter(id => !checkedSubIds.includes(id));
        setSelectedSubIds(toKeep);
        setCheckedSubIds([]);
    };
    const renderNodeItem = (node: Node) => {
        const isSelected = selectedNodeIds.includes(node.id);
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
                actions={[ <Button shape="circle" size="small" icon={isSelected ? <ArrowLeftOutlined /> : <ArrowRightOutlined />} onClick={() => isSelected ? setSelectedNodeIds(p => p.filter(id => id !== node.id)) : setSelectedNodeIds(p => [...p, node.id])} /> ]}
            >
                <Checkbox checked={checkedNodeIds.includes(node.id)} onChange={e => handleNodeCheckChange(node.id, e.target.checked)}>
                    <List.Item.Meta
                        avatar={<ClusterOutlined />}
                        title={<Text style={{ display: 'inline-block', maxWidth: 250 }} ellipsis={{ tooltip: node.name }}>{node.name}</Text>}
                        description={<Space>{statusTag}<Tag>{node.type}</Tag></Space>}
                    />
                </Checkbox>
            </List.Item>
        );
    };
    const renderSubItem = (sub: Subscription) => {
        const isSelected = selectedSubIds.includes(sub.id);
        return (
            <List.Item
                actions={[ <Button shape="circle" size="small" icon={isSelected ? <ArrowLeftOutlined /> : <ArrowRightOutlined />} onClick={() => isSelected ? setSelectedSubIds(p => p.filter(id => id !== sub.id)) : setSelectedSubIds(p => [...p, sub.id])} /> ]}
            >
                <Checkbox checked={checkedSubIds.includes(sub.id)} onChange={e => handleSubCheckChange(sub.id, e.target.checked)}>
                    <List.Item.Meta
                        avatar={<WifiOutlined />}
                        title={<Text style={{ display: 'inline-block', maxWidth: 250 }} ellipsis={{ tooltip: sub.name }}>{sub.name}</Text>}
                        description={<Text style={{ display: 'inline-block', maxWidth: 250 }} ellipsis={{ tooltip: sub.url }}>{sub.url}</Text>}
                    />
                </Checkbox>
            </List.Item>
        );
    };


  if (dataLoading) return <Spin tip="加载中..." />;

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} initialValues={profile}>
      <Form.Item name="name" label={<Title level={5}>配置文件名称</Title>} rules={[{ required: true, message: '请输入配置文件名称' }]}>
        <Input placeholder="例如：主力配置" />
      </Form.Item>

      <Form.Item
        label="Custom Subscription Path"
        name="alias"
        tooltip="Create a short, memorable link like /sub/my-best-nodes. Use only letters, numbers, hyphen, and underscore."
      >
        <Input addonBefore={"/sub/"} />
      </Form.Item>

      <Title level={5} style={{marginTop: '24px'}}>选择节点</Title>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
            {/* *** 這是關鍵的修改 2: 調整佈局 *** */}
            <Card 
                title={`可选节点 (${availableNodes.length})`} 
                size="small"
                extra={<Search placeholder="搜索..." onChange={e => setNodeSearchTerm(e.target.value)} style={{ width: 200 }}/>}
            >
                <List style={{ height: 400, overflow: 'auto' }} dataSource={availableNodes} renderItem={renderNodeItem} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="无可用节点" /> }}/>
            </Card>
        </div>
        <Space direction="vertical">
            <Button icon={<ArrowRightOutlined/>} onClick={moveCheckedNodes} disabled={checkedNodeIds.filter(id => !selectedNodeIds.includes(id)).length === 0} />
            <Button icon={<ArrowLeftOutlined/>} onClick={removeCheckedNodes} disabled={checkedNodeIds.filter(id => selectedNodeIds.includes(id)).length === 0} />
        </Space>
        <div style={{ flex: 1, minWidth: 0 }}>
             <Card title={`已选节点 (${selectedNodes.length})`} size="small">
                <div style={{ height: 32, marginBottom: 8 }}></div> {/* 占位符，與左側搜索框對齊 */}
                <List style={{ height: 400, overflow: 'auto' }} dataSource={selectedNodes} renderItem={renderNodeItem} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请从左侧添加" /> }}/>
            </Card>
        </div>
      </div>

      <Title level={5} style={{marginTop: '24px'}}>选择订阅</Title>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
            <Card 
                title={`可选订阅 (${availableSubs.length})`} 
                size="small"
                extra={<Search placeholder="搜索..." onChange={e => setSubSearchTerm(e.target.value)} style={{ width: 200 }}/>}
            >
                <List style={{ height: 200, overflow: 'auto' }} dataSource={availableSubs} renderItem={renderSubItem} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="无可用订阅" /> }}/>
            </Card>
        </div>
        <Space direction="vertical">
            <Button icon={<ArrowRightOutlined/>} onClick={moveCheckedSubs} disabled={checkedSubIds.filter(id => !selectedSubIds.includes(id)).length === 0} />
            <Button icon={<ArrowLeftOutlined/>} onClick={removeCheckedSubs} disabled={checkedSubIds.filter(id => selectedSubIds.includes(id)).length === 0} />
        </Space>
        <div style={{ flex: 1, minWidth: 0 }}>
             <Card title={`已选订阅 (${selectedSubs.length})`} size="small">
                <div style={{ height: 32, marginBottom: 8 }}></div>
                <List style={{ height: 200, overflow: 'auto' }} dataSource={selectedSubs} renderItem={renderSubItem} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请从左侧添加" /> }}/>
            </Card>
        </div>
      </div>

      <Form.Item style={{ marginTop: 24 }}>
        <Button type="primary" htmlType="submit" loading={loading} size="large">
          {profile ? '更新配置文件' : '创建配置文件'}
        </Button>
      </Form.Item>
    </Form>
  )
}