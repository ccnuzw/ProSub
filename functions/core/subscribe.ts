import { jsonResponse, errorResponse } from './utils/response';
import { generateSubscriptionResponse } from '@shared/subscription-generator';



async function getProfile(KV: KVNamespace, profileId: string): Promise<Profile | null> {
  const profileJson = await KV.get(`profile:${profileId}`);
  return profileJson ? JSON.parse(profileJson) : null;
}

async function recordTraffic(KV: KVNamespace, profileId: string) {
  try {
    const timestamp = new Date().toISOString();
    const key = `traffic:${profileId}:${timestamp}`;
    await KV.put(key, JSON.stringify({ timestamp, profileId }));
  } catch (error) {
    console.error('Failed to record traffic:', error);
  }
}

export async function handleSubscribe(request: Request, env: Env, profile_id: string): Promise<Response> {
  try {
    const KV = env.KV;
    const profile = await getProfile(KV, profile_id);
    if (!profile) return errorResponse('Profile not found', 404);

    await recordTraffic(KV, profile_id);

    return await generateSubscriptionResponse(request, profile, env);

  } catch (error) {
    console.error(`Failed to generate subscription for profile ${profile_id}:`, error);
    return errorResponse('Failed to generate subscription');
  }
}
