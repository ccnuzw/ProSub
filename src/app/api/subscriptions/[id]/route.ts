export const runtime = 'edge';
import { NextResponse, NextRequest } from 'next/server'
import { Subscription } from '@/types'

interface SubscriptionRequest {
  name: string;
  url: string;
}

const getKV = () => {
  return process.env.KV as KVNamespace
}

export async function GET(request: NextRequest, { params }: { // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
}) {
  try {
    const KV = getKV()
    const subJson = await KV.get(`subscription:${params.id}`)
    if (!subJson) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }
    return NextResponse.json(JSON.parse(subJson))
  } catch (error) {
    console.error(`Failed to fetch subscription ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
}) {
  try {
    const { name, url } = (await request.json()) as SubscriptionRequest
    const updatedSubscription: Subscription = { id: params.id, name, url }
    
    const KV = getKV()
    await KV.put(`subscription:${params.id}`, JSON.stringify(updatedSubscription))
    
    return NextResponse.json(updatedSubscription)
  } catch (error) {
    console.error(`Failed to update subscription ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
}) {
  try {
    const KV = getKV()
    await KV.delete(`subscription:${params.id}`)
    
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error(`Failed to delete subscription ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 })
  }
}
