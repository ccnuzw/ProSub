
'use client'

import { useState, useEffect } from 'react'
import { Form, Input, Button, Checkbox, Row, Col, Card, message, Spin } from 'antd'
import { useRouter } from 'next/navigation'
import { Profile, Node, Subscription } from '@/types'

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

  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true)
      try {
        const [nodesRes, subsRes] = await Promise.all([
          fetch('/api/nodes'),
          fetch('/api/subscriptions'),
        ])
        setAllNodes(await nodesRes.json())
        setAllSubscriptions(await subsRes.json())
      } catch (error) {
        console.error('Failed to fetch nodes and subscriptions:', error)
        message.error('加载节点和订阅数据失败')
      } finally {
        setDataLoading(false)
      }
    }
    fetchData()
  }, [])

  const onFinish = async (values: Profile) => {
    setLoading(true)
    const method = profile ? 'PUT' : 'POST'
    const url = profile ? `/api/profiles/${profile.id}` : '/api/profiles'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (res.ok) {
        message.success(profile ? '配置文件更新成功' : '配置文件创建成功')
        router.push('/profiles')
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

  if (dataLoading) {
    return <Spin tip="加载中..."></Spin>
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={profile}
    >
      <Form.Item
        name="name"
        label="配置文件名称"
        rules={[{ required: true, message: '请输入配置文件名称' }]}
      >
        <Input />
      </Form.Item>

      <Card title="选择节点" style={{ marginBottom: 24 }}>
        <Form.Item name="nodes" valuePropName="checked">
          <Checkbox.Group style={{ width: '100%' }}>
            <Row gutter={[16, 16]}>
              {allNodes.map(node => (
                <Col key={node.id} xs={24} sm={12} md={8} lg={6}>
                  <Checkbox value={node.id}>{node.name}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>
      </Card>

      <Card title="选择订阅">
        <Form.Item name="subscriptions" valuePropName="checked">
          <Checkbox.Group style={{ width: '100%' }}>
            <Row gutter={[16, 16]}>
              {allSubscriptions.map(sub => (
                <Col key={sub.id} xs={24} sm={12} md={8} lg={6}>
                  <Checkbox value={sub.id}>{sub.name}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>
      </Card>

      <Form.Item style={{ marginTop: 24 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          {profile ? '更新' : '创建'}
        </Button>
      </Form.Item>
    </Form>
  )
}
