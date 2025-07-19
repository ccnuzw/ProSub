export const runtime = 'edge';
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import SubscriptionForm from '@/components/SubscriptionForm'
import { Subscription } from '@/types'

export default function EditSubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const params = useParams()
  const { id } = params

  useEffect(() => {
    if (id) {
      const fetchSubscription = async () => {
        const res = await fetch(`/api/subscriptions/${id}`)
        if (res.ok) {
          const data = (await res.json()) as Subscription
          setSubscription(data)
        }
      }
      fetchSubscription()
    }
  }, [id])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Subscription</h1>
      {subscription ? <SubscriptionForm subscription={subscription} /> : <p>Loading...</p>}
    </div>
  )
}
