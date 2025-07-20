export const runtime = 'edge';
import { type NextRequest, NextResponse } from 'next/server'
import { Profile } from '@/types'

interface ProfileRequest {
  name: string;
  nodes: string[];
  subscriptions: string[];
  alias?: string;
}

const getKV = () => {
  return (globalThis as unknown as { KV: KVNamespace }).KV
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
    const { name, nodes = [], subscriptions = [], alias } = (await request.json()) as ProfileRequest

    if (!name) {
      return new Response('Profile name is required', { status: 400 })
    }

    const KV = getKV();

    // Check if alias is already in use and validate it
    if (alias) {
      if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
        return new Response('Invalid characters in custom path. Use only letters, numbers, hyphen, and underscore.', { status: 400 });
      }
      const existingAlias = await KV.get(`alias:${alias}`);
      if (existingAlias) {
        return new Response('This custom path is already in use.', { status: 409 });
      }
    }

    const newProfile: Profile = {
      id: crypto.randomUUID(),
      name,
      alias: alias || undefined,
      nodes,
      subscriptions,
      updatedAt: new Date().toISOString(),
    };

    await KV.put(`profile:${newProfile.id}`, JSON.stringify(newProfile));

    // Create the alias mapping if it exists
    if (alias) {
      await KV.put(`alias:${alias}`, JSON.stringify({ id: newProfile.id }));
    }

    return NextResponse.json(newProfile, { status: 201 });
  } catch (error) {
    console.error('Failed to create profile:', error);
    return new Response('Failed to create profile', { status: 500 });
  }
}
