
import { NextResponse } from 'next/server'
import { Profile } from '@/types'

const getKVNamespace = () => {
  return process.env.PROSUB_KV as KVNamespace
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const kv = getKVNamespace()
    const profileJson = await kv.get(`profile:${params.id}`)
    if (!profileJson) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    return NextResponse.json(JSON.parse(profileJson))
  } catch (error) {
    console.error(`Failed to fetch profile ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { name, nodes, subscriptions } = await request.json()
    const updatedProfile: Profile = { id: params.id, name, nodes, subscriptions }
    
    const kv = getKVNamespace()
    await kv.put(`profile:${params.id}`, JSON.stringify(updatedProfile))
    
    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error(`Failed to update profile ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const kv = getKVNamespace()
    await kv.delete(`profile:${params.id}`)
    
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error(`Failed to delete profile ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 })
  }
}
