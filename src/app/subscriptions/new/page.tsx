'use client'

import SubscriptionForm from '@/components/SubscriptionForm'
import { Card, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Link from 'next/link'

export default function NewSubscriptionPage() {
  return (
    <Card
      title="添加新订阅"
      extra={
        <Link href="/subscriptions">
          <Button icon={<ArrowLeftOutlined />}>返回列表</Button>
        </Link>
      }
    >
      <SubscriptionForm />
    </Card>
  )
}