'use client'
export const runtime = 'edge';

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Subscription } from '@/types'
import { Card, Button, Spin } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// 動態導入 SubscriptionForm 組件
const SubscriptionForm = dynamic(() => import('@/components/SubscriptionForm'), { 
    loading: () => <Spin tip="正在加载表单..." />,
    ssr: false 
});

export default function EditSubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true);
  const params = useParams()
  const { id } = params

  useEffect(() => {
    if (id) {
      const fetchSubscription = async () => {
        setLoading(true);
        const res = await fetch(`/api/subscriptions/${id}`)
        if (res.ok) {
          const data = (await res.json()) as Subscription
          setSubscription(data)
        }
        setLoading(false);
      }
      fetchSubscription()
    }
  }, [id])

  return (
    <Card
      title="编辑订阅"
      extra={
        <Link href="/subscriptions">
          <Button icon={<ArrowLeftOutlined />}>返回列表</Button>
        </Link>
      }
    >
      {loading ? <Spin /> : (subscription ? <SubscriptionForm subscription={subscription} /> : <p>加载失败或订阅不存在。</p>)}
    </Card>
  )
}