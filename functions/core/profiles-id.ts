import { jsonResponse, errorResponse } from './utils/response';
import { requireAuth } from './utils/auth';

interface ProfileRequestBody {
  name?: string;
  nodes?: string[];
  subscriptions?: string[];
  alias?: string;
}

export async function handleProfileGet(request: Request, env: Env, id: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const KV = env.KV
    const profileJson = await KV.get(`profile:${id}`)
    if (!profileJson) {
      return errorResponse('Profile not found', 404);
    }
    return jsonResponse(JSON.parse(profileJson));
  } catch (error) {
    console.error(`Failed to fetch profile ${id}:`, error)
    return errorResponse('Failed to fetch profile');
  }
}

export async function handleProfilePut(request: Request, env: Env, id: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const KV = env.KV
    const profileId = id;

    const profileJson = await KV.get(`profile:${profileId}`);
    if (!profileJson) {
      return errorResponse('Profile not found', 404);
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
          return errorResponse('This custom path is already in use by another profile.', 409);
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

    return jsonResponse(updatedProfile);
  } catch (error) {
    console.error(`Failed to update profile ${id}:`, error);
    return errorResponse('Failed to update profile');
  }
}

export async function handleProfileDelete(request: Request, env: Env, id: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

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

    const profileIndexJson = await KV.get('_index:profiles');
    const profileIds = profileIndexJson ? JSON.parse(profileIndexJson) : [];
    const updatedProfileIds = profileIds.filter((profileId: string) => profileId !== id);
    await KV.put('_index:profiles', JSON.stringify(updatedProfileIds));

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete profile ${id}:`, error)
    return errorResponse('Failed to delete profile');
  }
}