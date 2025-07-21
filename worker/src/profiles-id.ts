import { Profile } from '@/types';

interface ProfileRequestBody {
  name?: string;
  nodes?: string[];
  subscriptions?: string[];
  alias?: string;
}

interface Env {
  KV: KVNamespace;
}

export async function handleProfileGet(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const KV = env.KV
    const profileJson = await KV.get(`profile:${id}`)
    if (!profileJson) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    }
    return new Response(JSON.stringify(JSON.parse(profileJson)), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error(`Failed to fetch profile ${id}:`, error)
    return new Response(JSON.stringify({ error: 'Failed to fetch profile' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function handleProfilePut(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const KV = env.KV
    const profileId = id;

    const profileJson = await KV.get(`profile:${profileId}`);
    if (!profileJson) {
      return new Response('Profile not found', { status: 404 });
    }
    const existingProfile: Profile = JSON.parse(profileJson);

    const body: ProfileRequestBody = await request.json();
    const { name, nodes, subscriptions, alias } = body;

    const oldAlias = existingProfile.alias;
    const newAlias = alias;

    if (newAlias && newAlias !== oldAlias) {
      const existingAlias = await KV.get(`alias:${newAlias}`);
      if (existingAlias) {
        const owner = JSON.parse(existingAlias);
        if (owner.id !== profileId) {
          return new Response('This custom path is already in use by another profile.', { status: 409 });
        }
      }
      await KV.put(`alias:${newAlias}`, JSON.stringify({ id: profileId }));
    }

    if (oldAlias && oldAlias !== newAlias) {
      await KV.delete(`alias:${oldAlias}`);
    }

    const updatedProfile: Profile = {
      ...existingProfile,
      name: name ?? existingProfile.name,
      nodes: nodes ?? existingProfile.nodes,
      subscriptions: subscriptions ?? existingProfile.subscriptions,
      alias: newAlias || undefined,
      updatedAt: new Date().toISOString(),
    };

    await KV.put(`profile:${profileId}`, JSON.stringify(updatedProfile));

    return new Response(JSON.stringify(updatedProfile), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error(`Failed to update profile ${id}:`, error);
    return new Response('Failed to update profile', { status: 500 });
  }
}

export async function handleProfileDelete(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const KV = env.KV
    const profile = await KV.get(`profile:${id}`)
    if (profile) {
      const { alias } = JSON.parse(profile)
      if (alias) {
        await KV.delete(`alias:${alias}`)
      }
    }
    await KV.delete(`profile:${id}`)

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error(`Failed to delete profile ${id}:`, error)
    return new Response(JSON.stringify({ error: 'Failed to delete profile' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
