export const runtime = 'edge';
import { NextResponse, NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { Profile } from '@/types'

interface ProfileRequest {
  name: string;
  nodes: string[];
  subscriptions: string[];
}

const getKV = () => {
  return process.env.KV as KVNamespace
}

export async function GET() {
  try {
    const KV = getKV()
    const profileList = await KV.list({ prefix: 'profile:' })
    const profiles = await Promise.all(
      profileList.keys.map(async ({ name }) => {
        const profileJson = await KV.get(name)
        return profileJson ? JSON.parse(profileJson) : null
      })
    )
    return NextResponse.json(profiles.filter(Boolean))
  } catch (error) {
    console.error('Failed to fetch profiles:', error)
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, nodes, subscriptions } = (await request.json()) as ProfileRequest
    const id = uuidv4()
    const newProfile: Profile = { id, name, nodes, subscriptions }
    
    const KV = getKV()
    await KV.put(`profile:${id}`, JSON.stringify(newProfile))
    
    return NextResponse.json(newProfile)
  } catch (error) {
    console.error('Failed to create profile:', error)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}