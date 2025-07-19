export const runtime = 'edge';
import { NextResponse, NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { Subscription } from '@/types'

interface SubscriptionRequest {
  name: string;
  url: string;
}

const getKV = () => {
  return process.env.KV as KVNamespace
}

export async function GET() {
  try {
    const KV = getKV()
    const subList = await KV.list({ prefix: 'subscription:' })
    const subscriptions = await Promise.all(
      subList.keys.map(async ({ name }) => {
        const subJson = await KV.get(name)
        return subJson ? JSON.parse(subJson) : null
      })
    )
    return NextResponse.json(subscriptions.filter(Boolean))
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, url } = (await request.json()) as SubscriptionRequest
    const id = uuidv4()
    const newSubscription: Subscription = { id, name, url }
    
    const KV = getKV()
    await KV.put(`subscription:${id}`, JSON.stringify(newSubscription))
    
    return NextResponse.json(newSubscription)
  } catch (error) {
    console.error('Failed to create subscription:', error)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}