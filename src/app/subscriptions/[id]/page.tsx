'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import SubscriptionForm from '@/components/SubscriptionForm'
import { Subscription } from '@/types'
import { Card, Button, Spin } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Link from 'next/link'

export const runtime = 'edge';

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