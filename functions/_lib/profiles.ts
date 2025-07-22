import { jsonResponse, errorResponse } from './utils/response';

interface ProfileRequest {
  name: string;
  nodes: string[];
  subscriptions: string[];
  alias?: string;
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
    return jsonResponse(profiles.filter(Boolean));
  } catch (error) {
    console.error('Failed to fetch profiles:', error)
    return errorResponse('Failed to fetch profiles');
  }
}

export async function handleProfilesPost(request: Request, env: Env): Promise<Response> {
  try {
    const { name, nodes = [], subscriptions = [], alias } = (await request.json()) as ProfileRequest

    if (!name) {
      return errorResponse('Profile name is required', 400);
    }

    const KV = env.KV;

    if (alias) {
      if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
        return errorResponse('Invalid characters in custom path. Use only letters, numbers, hyphen, and underscore.', 400);
      }
      const existingAlias = await KV.get(`alias:${alias}`);
      if (existingAlias) {
        return errorResponse('This custom path is already in use.', 409);
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

    return jsonResponse(newProfile, 201);
  } catch (error) {
    console.error('Failed to create profile:', error);
    return errorResponse('Failed to create profile');
  }
}
