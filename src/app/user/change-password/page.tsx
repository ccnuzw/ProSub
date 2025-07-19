'use client'

import { Form, Input, Button, message, Card, Row, Col, Typography } from 'antd'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { User } from '@/types'
import { LockOutlined } from '@ant-design/icons'

const { Title } = Typography;

interface ChangePasswordFormValues {
  newPassword?: string;
  confirmNewPassword?: string;
}

export default function ChangePasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: ChangePasswordFormValues) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/me') 
      if (!res.ok) {
        throw new Error('无法获取当前用户信息')
      }
      const currentUser = (await res.json()) as User

      const updateRes = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: values.newPassword }),
      })

      if (updateRes.ok) {
        message.success('密码修改成功，请重新登录')
        // 登出以使用户会话失效
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/user/login')
        router.refresh();
      } else {
        const errorData = (await updateRes.json()) as { message: string }
        message.error(errorData.message || '密码修改失败')
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message || '网络错误，请重试')
      } else {
        message.error(String(error) || '网络错误，请重试')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Row justify="center" align="middle" style={{ minHeight: '60vh' }}>
        <Col xs={24} sm={16} md={12} lg={8}>
            <Card>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <LockOutlined style={{ fontSize: '32px', color: '#1677ff' }}/>
                    <Title level={3}>修改密码</Title>
                </div>
                <Form
                    name="change_password"
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Form.Item
                        label="新密码"
                        name="newPassword"
                        rules={[{ required: true, message: '请输入新密码!' }]}
                    >
                    <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="确认新密码"
                        name="confirmNewPassword"
                        dependencies={['newPassword']}
                        hasFeedback
                        rules={[
                            { required: true, message: '请确认新密码!' },
                            ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve()
                                }
                                return Promise.reject(new Error('两次输入的密码不一致!'))
                            },
                            }),
                        ]}
                    >
                    <Input.Password />
                    </Form.Item>

                    <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                        确认修改
                    </Button>
                    </Form.Item>
                </Form>
            </Card>
        </Col>
    </Row>
  )
}