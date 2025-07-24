import { jsonResponse, errorResponse } from './utils/response';
import { requireAuth } from './utils/auth';

interface ProfileRequest {
  name: string;
  nodes: string[];
  subscriptions: string[];
  alias?: string;
}

export async function handleProfilesGet(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const KV = env.KV
    const profileIndexJson = await KV.get('_index:profiles');
    const profileIds = profileIndexJson ? JSON.parse(profileIndexJson) : [];

    const profiles = await Promise.all(
      profileIds.map(async (profileId: string) => {
        const profileJson = await KV.get(`profile:${profileId}`);
        return profileJson ? JSON.parse(profileJson) : null;
      })
    );

    return jsonResponse(profiles.filter(Boolean));
  } catch (error) {
    console.error('Failed to fetch profiles:', error)
    return errorResponse('Failed to fetch profiles');
  }
}

export async function handleProfilesPost(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

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

    const profileIndexJson = await KV.get('_index:profiles');
    const profileIds = profileIndexJson ? JSON.parse(profileIndexJson) : [];
    profileIds.push(newProfile.id);
    await KV.put('_index:profiles', JSON.stringify(profileIds));

    return jsonResponse(newProfile, 201);
  } catch (error) {
    console.error('Failed to create profile:', error);
    return errorResponse('Failed to create profile');
  }
}