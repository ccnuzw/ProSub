'use client'

import { Form, Input, Button, message, Card, Row, Col, Typography } from 'antd'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LoginOutlined } from '@ant-design/icons'

const { Title } = Typography;

interface LoginFormValues {
  name?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (res.ok) {
        message.success('登录成功')
        router.push('/dashboard')
        router.refresh(); // 强制刷新以更新布局中的用户信息
      } else {
        const errorData = (await res.json()) as { message: string }
        message.error(errorData.message || '登录失败')
      }
    } catch (error) {
      console.error('Login failed:', error)
      message.error('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Row justify="center" align="middle" style={{ minHeight: '60vh' }}>
      <Col xs={24} sm={16} md={12} lg={8}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <LoginOutlined style={{ fontSize: '32px', color: '#1677ff' }}/>
            <Title level={3}>登录 ProSub</Title>
          </div>
          <Form
            name="login"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="用户名"
              name="name"
              rules={[{ required: true, message: '请输入用户名!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码!' }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                登录
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  )
}