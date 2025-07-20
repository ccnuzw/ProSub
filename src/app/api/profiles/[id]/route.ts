export const runtime = 'edge';
import { type NextRequest, NextResponse } from 'next/server'
import { Profile } from '@/types'

interface ProfileRequestBody {
  name?: string;
  nodes?: string[];
  subscriptions?: string[];
  alias?: string;
}

const getKV = () => {
  return (globalThis as unknown as { KV: KVNamespace }).KV
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const KV = getKV()
    const profileId = params.id;

    // 1. Get existing profile
    const profileJson = await KV.get(`profile:${profileId}`);
    if (!profileJson) {
      return new Response('Profile not found', { status: 404 });
    }
    const existingProfile: Profile = JSON.parse(profileJson);

    // 2. Get new data from request body
    const body: ProfileRequestBody = await request.json();
    const { name, nodes, subscriptions, alias } = body;

    // 3. Handle alias update
    const oldAlias = existingProfile.alias;
    const newAlias = alias;

    if (newAlias && newAlias !== oldAlias) {
      // Check if the new alias is already taken
      const existingAlias = await KV.get(`alias:${newAlias}`);
      if (existingAlias) {
        const owner = JSON.parse(existingAlias);
        if (owner.id !== profileId) {
          return new Response('This custom path is already in use by another profile.', { status: 409 });
        }
      }
      // If validation passes, set the new alias mapping
      await KV.put(`alias:${newAlias}`, JSON.stringify({ id: profileId }));
    }

    // If the alias was removed or changed, delete the old one
    if (oldAlias && oldAlias !== newAlias) {
      await KV.delete(`alias:${oldAlias}`);
    }

    // 4. Update the profile object
    const updatedProfile: Profile = {
      ...existingProfile,
      name: name ?? existingProfile.name,
      nodes: nodes ?? existingProfile.nodes,
      subscriptions: subscriptions ?? existingProfile.subscriptions,
      alias: newAlias || undefined,
      updatedAt: new Date().toISOString(),
    };

    await KV.put(`profile:${profileId}`, JSON.stringify(updatedProfile));

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error(`Failed to update profile ${params.id}:`, error);
    return new Response('Failed to update profile', { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
}) {
  try {
    const KV = getKV()
    const profile = await KV.get(`profile:${params.id}`)
    if (profile) {
      const { alias } = JSON.parse(profile)
      if (alias) {
        await KV.delete(`alias:${alias}`)
      }
    }
    await KV.delete(`profile:${params.id}`)

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error(`Failed to delete profile ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 })
  }
}
