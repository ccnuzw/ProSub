
import { NextResponse } from 'next/server'
import { Subscription } from '@/types'

const getKVNamespace = () => {
  return (process.env as any).PROSUB_KV as KVNamespace
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const kv = getKVNamespace()
    const subJson = await kv.get(`subscription:${params.id}`)
    if (!subJson) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }
    return NextResponse.json(JSON.parse(subJson))
  } catch (error) {
    console.error(`Failed to fetch subscription ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { name, url } = await request.json()
    const updatedSubscription: Subscription = { id: params.id, name, url }
    
    const kv = getKVNamespace()
    await kv.put(`subscription:${params.id}`, JSON.stringify(updatedSubscription))
    
    return NextResponse.json(updatedSubscription)
  } catch (error) {
    console.error(`Failed to update subscription ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const kv = getKVNamespace()
    await kv.delete(`subscription:${params.id}`)
    
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error(`Failed to delete subscription ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 })
  }
}
