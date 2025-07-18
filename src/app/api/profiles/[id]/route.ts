
import { NextResponse, NextRequest } from 'next/server'
import { Profile } from '@/types'

interface ProfileRequest {
  name: string;
  nodes: string[];
  subscriptions: string[];
}

const getKV = () => {
  return process.env.KV as KVNamespace
}

export async function GET(request: NextRequest, { params }: { // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
}) {
  try {
    const KV = getKV()
    const profileJson = await KV.get(`profile:${params.id}`)
    if (!profileJson) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    return NextResponse.json(JSON.parse(profileJson))
  } catch (error) {
    console.error(`Failed to fetch profile ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
}) {
  try {
    const { name, nodes, subscriptions } = (await request.json()) as ProfileRequest
    const updatedProfile: Profile = { id: params.id, name, nodes, subscriptions }
    
    const KV = getKV()
    await KV.put(`profile:${params.id}`, JSON.stringify(updatedProfile))
    
    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error(`Failed to update profile ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
}) {
  try {
    const KV = getKV()
    await KV.delete(`profile:${params.id}`)
    
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error(`Failed to delete profile ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 })
  }
}
