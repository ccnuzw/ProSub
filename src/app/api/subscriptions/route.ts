import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { Subscription } from '@/types'

const getKVNamespace = () => {
  return (process.env as any).PROSUB_KV as KVNamespace
}

export async function GET() {
  try {
    const kv = getKVNamespace()
    const subList = await kv.list({ prefix: 'subscription:' })
    const subscriptions = await Promise.all(
      subList.keys.map(async ({ name }) => {
        const subJson = await kv.get(name)
        return subJson ? JSON.parse(subJson) : null
      })
    )
    return NextResponse.json(subscriptions.filter(Boolean))
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, url } = await request.json()
    const id = uuidv4()
    const newSubscription: Subscription = { id, name, url }
    
    const kv = getKVNamespace()
    await kv.put(`subscription:${id}`, JSON.stringify(newSubscription))
    
    return NextResponse.json(newSubscription)
  } catch (error) {
    console.error('Failed to create subscription:', error)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}