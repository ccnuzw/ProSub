import { Profile } from './types';

interface ProfileRequest {
  name: string;
  nodes: string[];
  subscriptions: string[];
  alias?: string;
}

interface Env {
  KV: KVNamespace;
}

export async function handleProfilesGet(request: Request, env: Env): Promise<Response> {
  try {
    const KV = env.KV
    const profileList = await KV.list({ prefix: 'profile:' })
    const profiles = await Promise.all(
      profileList.keys.map(async ({ name }) => {
        const profileJson = await KV.get(name)
        return profileJson ? JSON.parse(profileJson) : null
      })
    )
    return new Response(JSON.stringify(profiles.filter(Boolean)), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Failed to fetch profiles:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch profiles' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function handleProfilesPost(request: Request, env: Env): Promise<Response> {
  try {
    const { name, nodes = [], subscriptions = [], alias } = (await request.json()) as ProfileRequest

    if (!name) {
      return new Response('Profile name is required', { status: 400 })
    }

    const KV = env.KV;

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

    if (alias) {
      await KV.put(`alias:${alias}`, JSON.stringify({ id: newProfile.id }));
    }

    return new Response(JSON.stringify(newProfile), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Failed to create profile:', error);
    return new Response('Failed to create profile', { status: 500 });
  }
}
