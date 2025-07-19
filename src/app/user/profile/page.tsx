'use client'

import { useState, useEffect } from 'react'
import { Button, Card, message, Spin, Row, Col, Descriptions, Typography, Space, Modal, Form, Input } from 'antd'
import { useRouter } from 'next/navigation'
import { User } from '@/types'
import { UserOutlined, LogoutOutlined, EditOutlined } from '@ant-design/icons'

const { Title } = Typography;

export default function UserProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter()

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = (await res.json()) as User
          setUser(data)
          form.setFieldsValue(data); // 設置表單初始值
        } else if (res.status === 401) {
          message.warning('请先登录')
          router.push('/user/login')
        } else {
          throw new Error('获取用户信息失败')
        }
      } catch (error) {
        message.error('加载用户资料失败')
      } finally {
        setLoading(false)
      }
    }
    fetchUserProfile()
  }, [router, form])

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        message.success('登出成功')
        router.push('/user/login')
        router.refresh();
      } else {
        throw new Error('登出失败')
      }
    } catch (error) {
      message.error('登出失败，请重试')
    }
  }

  const handleUpdateProfile = async (values: any) => {
    setLoading(true);
    try {
        const payload: any = {};
        if (values.newPassword) {
            payload.password = values.newPassword;
        }

        const res = await fetch(`/api/users/${user?.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            message.success('资料更新成功！下次登录请使用新密码。');
            setIsModalVisible(false);
        } else {
            const errorData = await res.json();
            throw new Error(errorData.message || '更新失败');
        }
    } catch (error) {
        if(error instanceof Error) message.error(error.message);
    } finally {
        setLoading(false);
    }
  }

  return (
    <>
      <Row justify="center" align="middle" style={{ minHeight: '60vh' }}>
        <Col xs={24} sm={20} md={16} lg={12}>
          <Spin spinning={loading} tip="加载中...">
            <Card>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <UserOutlined style={{ fontSize: '32px', color: '#1677ff' }}/>
                  <Title level={3}>我的资料</Title>
              </div>
              {user && (
                <>
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="用户名">{user.name}</Descriptions.Item>
                    <Descriptions.Item label="用户ID">{user.id}</Descriptions.Item>
                    <Descriptions.Item label="关联配置文件数量">{user.profiles.length}</Descriptions.Item>
                  </Descriptions>
                  <Space style={{ marginTop: '24px', width: '100%', justifyContent: 'flex-end' }}>
                      <Button icon={<EditOutlined />} onClick={() => setIsModalVisible(true)}>
                          修改密码
                      </Button>
                      <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
                          登出
                      </Button>
                  </Space>
                </>
              )}
            </Card>
          </Spin>
        </Col>
      </Row>
      <Modal
        title="修改密码"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        okText="确认修改"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
            <Form.Item
                label="新密码 (留空则不修改)"
                name="newPassword"
            >
                <Input.Password />
            </Form.Item>
            <Form.Item
                label="确认新密码"
                name="confirmNewPassword"
                dependencies={['newPassword']}
                hasFeedback
                rules={[
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
        </Form>
      </Modal>
    </>
  )
}