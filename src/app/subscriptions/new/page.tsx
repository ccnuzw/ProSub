'use client'

import { Card, Button, Spin } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// 動態導入 SubscriptionForm 組件
const SubscriptionForm = dynamic(() => import('@/components/SubscriptionForm'), { 
    loading: () => <Spin tip="正在加载表单..." />,
    ssr: false 
});

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