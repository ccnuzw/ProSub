import { handleSubscribe } from '../_lib/subscribe';
import { Env } from '../_lib/types';

export const onRequestGet = async ({ request, env, params }: { request: Request; env: Env; params: { alias: string } }) => {
  const alias = params.alias;
  try {
    const KV = env.KV;
    const idRecord = await KV.get(`alias:${alias}`);
    if (!idRecord) {
      return new Response('Subscription alias not found', { status: 404 });
    }
    const { id: profileId } = JSON.parse(idRecord);

    const profileJson = await KV.get(`profile:${profileId}`);
    if (!profileJson) {
      return new Response('Profile data not found for the alias', { status: 404 });
    }
    const profile = JSON.parse(profileJson);

    // Record traffic (simplified for now)
    try {
      const timestamp = new Date().toISOString();
      const key = `traffic:${profileId}:${timestamp}`;
      await KV.put(key, JSON.stringify({ timestamp, profileId, alias }));
    } catch (error) {
      console.error('Failed to record traffic:', error);
    }

    // Use the generateSubscriptionResponse from lib
    return await handleSubscribe(request, env, profileId);

  } catch (error) {
    console.error(`Failed to generate subscription for alias ${alias}:`, error);
    return new Response('Failed to generate subscription', { status: 500 });
  }
};