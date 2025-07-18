
'use client'

import { Form, Input, Button, message } from 'antd'
import { useRouter } from 'next/navigation'
import { Subscription } from '@/types'
import { useState } from 'react'

interface SubscriptionFormProps {
  subscription?: Subscription
}

export default function SubscriptionForm({ subscription }: SubscriptionFormProps) {
  const [form] = Form.useForm()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: any) => {
    setLoading(true)
    const method = subscription ? 'PUT' : 'POST'
    const url = subscription ? `/api/subscriptions/${subscription.id}` : '/api/subscriptions'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (res.ok) {
        message.success(subscription ? '订阅更新成功' : '订阅创建成功')
        router.push('/subscriptions')
      } else {
        throw new Error('操作失败')
      }
    } catch (error) {
      message.error('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={subscription}
    >
      <Form.Item
        name="name"
        label="名称"
        rules={[{ required: true, message: '请输入订阅名称' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="url"
        label="订阅链接 (URL)"
        rules={[{ required: true, message: '请输入订阅链接' }, { type: 'url', message: '请输入有效的 URL' }]}
      >
        <Input type="url" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {subscription ? '更新' : '创建'}
        </Button>
      </Form.Item>
    </Form>
  )
}
