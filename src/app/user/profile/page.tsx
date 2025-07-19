'use client'

import { useState, useEffect } from 'react'
import { Button, Card, message, Spin, Row, Col, Descriptions, Typography, Space } from 'antd'
import { useRouter } from 'next/navigation'
import { User } from '@/types'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons'

const { Title } = Typography;

export default function UserProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = (await res.json()) as User
          setUser(data)
        } else if (res.status === 401) {
          message.warning('请先登录')
          router.push('/user/login')
        } else {
          throw new Error('获取用户信息失败')
        }
      } catch (error) {
        message.error('加载用户资料失败')
        console.error('Failed to fetch user profile:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUserProfile()
  }, [router])

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
      console.error('Failed to logout:', error)
      message.error('登出失败，请重试')
    }
  }

  return (
    <Row justify="center" align="middle" style={{ minHeight: '60vh' }}>
      <Col xs={24} sm={20} md={16} lg={12}>
        <Spin spinning={loading} tip="加载中...">
          <Card>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <UserOutlined style={{ fontSize: '32px', color: '#1677ff' }}/>
                <Title level={3}>用户资料</Title>
            </div>
            {user ? (
              <>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="用户名">{user.name}</Descriptions.Item>
                  <Descriptions.Item label="用户ID">{user.id}</Descriptions.Item>
                  <Descriptions.Item label="关联配置文件数量">{user.profiles.length}</Descriptions.Item>
                </Descriptions>
                <Space style={{ marginTop: '24px', width: '100%', justifyContent: 'flex-end' }}>
                    <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
                        登出
                    </Button>
                </Space>
              </>
            ) : (
              !loading && <p>无法加载用户资料。</p>
            )}
          </Card>
        </Spin>
      </Col>
    </Row>
  )
}