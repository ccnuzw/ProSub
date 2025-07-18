
'use client'

import { useState, useEffect } from 'react'
import { Form, Input, Button, Select, message, Spin } from 'antd'
import { useRouter } from 'next/navigation'
import { User, Profile } from '@/types'

const { Option } = Select

interface UserFormProps {
  user?: User
}

interface UserFormValues {
  name?: string;
  password?: string;
  confirmPassword?: string;
  profiles?: string[];
}

export default function UserForm({ user }: UserFormProps) {
  const [form] = Form.useForm()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [allProfiles, setAllProfiles] = useState<Profile[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true)
      try {
        const profilesRes = await fetch('/api/profiles')
        setAllProfiles(await profilesRes.json())
      } catch (error) {
        console.error('Failed to fetch profile data:', error)
        message.error('加载配置文件数据失败')
      } finally {
        setDataLoading(false)
      }
    }
    fetchData()

    if (user) {
      form.setFieldsValue(user)
    }
  }, [user, form])

  const onFinish = async (values: UserFormValues) => {
    setLoading(true)
    const method = user ? 'PUT' : 'POST'
    const url = user ? `/api/users/${user.id}` : '/api/users'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (res.ok) {
        message.success(user ? '用户更新成功' : '用户创建成功')
        router.push('/user')
      } else {
        const errorData = await res.json()
        message.error(errorData.message || '操作失败')
      }
    } catch (error) {
      console.error('User operation failed:', error)
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
    >
      <Form.Item
        name="name"
        label="用户名"
        rules={[{ required: true, message: '请输入用户名' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="password"
        label="密码"
        rules={user ? [] : [{ required: true, message: '请输入密码' }]}
      >
        <Input.Password placeholder={user ? '留空则不修改密码' : '请输入密码'} />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        label="确认密码"
        dependencies={['password']}
        hasFeedback
        rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('两次输入的密码不一致!'))
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        name="profiles"
        label="关联配置文件"
      >
        <Select mode="multiple" placeholder="请选择关联的配置文件">
          {allProfiles.map(profile => (
            <Option key={profile.id} value={profile.id}>
              {profile.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {user ? '更新' : '创建'}
        </Button>
      </Form.Item>
    </Form>
  )
}
