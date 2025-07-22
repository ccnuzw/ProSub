import { jsonResponse, errorResponse } from './utils/response';
import { generateSubscriptionResponse } from '@shared/subscription-generator';
import { Env, Profile } from '@shared/types'; // Import types

async function getProfile(KV: KVNamespace, profileId: string): Promise<Profile | null> {
  const profileJson = await KV.get(`profile:${profileId}`);
  return profileJson ? JSON.parse(profileJson) : null;
}

async function recordTraffic(KV: KVNamespace, profileId: string, alias?: string) {
  try {
    const timestamp = new Date().toISOString();
    const key = `traffic:${profileId}:${timestamp}`;
    await KV.put(key, JSON.stringify({ timestamp, profileId, alias }));
  } catch (error) {
    console.error('Failed to record traffic:', error);
  }
}

export async function handleSubscribe(request: Request, env: Env, profile_id: string, alias?: string): Promise<Response> {
  try {
    const KV = env.KV;
    const profile = await getProfile(KV, profile_id);
    if (!profile) return errorResponse('Profile not found', 404);

    await recordTraffic(KV, profile_id, alias);

    // Ensure the 'env' object is passed to the generator
    return await generateSubscriptionResponse(request, profile, env);

  } catch (error) {
    console.error(`Failed to generate subscription for profile ${profile_id}:`, error);
    return errorResponse('Failed to generate subscription');
  }
}