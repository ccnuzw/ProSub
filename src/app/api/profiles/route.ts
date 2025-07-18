import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { Profile } from '@/types'

const getKVNamespace = () => {
  return (process.env as any).PROSUB_KV as KVNamespace
}

export async function GET() {
  try {
    const kv = getKVNamespace()
    const profileList = await kv.list({ prefix: 'profile:' })
    const profiles = await Promise.all(
      profileList.keys.map(async ({ name }) => {
        const profileJson = await kv.get(name)
        return profileJson ? JSON.parse(profileJson) : null
      })
    )
    return NextResponse.json(profiles.filter(Boolean))
  } catch (error) {
    console.error('Failed to fetch profiles:', error)
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, nodes, subscriptions } = await request.json()
    const id = uuidv4()
    const newProfile: Profile = { id, name, nodes, subscriptions }
    
    const kv = getKVNamespace()
    await kv.put(`profile:${id}`, JSON.stringify(newProfile))
    
    return NextResponse.json(newProfile)
  } catch (error) {
    console.error('Failed to create profile:', error)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}