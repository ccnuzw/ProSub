"""// src/app/api/subscribe/[profile_id]/route.ts

export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { Profile } from '@/types';
import { generateSubscriptionResponse } from '@/lib/subscription-generator';

const getKV = () => {
  // @ts-ignore
  return process.env.KV as KVNamespace;
};

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

export async function GET(request: NextRequest, { params }: { params: { profile_id: string } }) {
  try {
    const KV = getKV();
    const profile = await getProfile(KV, params.profile_id);
    if (!profile) return new Response('Profile not found', { status: 404 });

    await recordTraffic(KV, params.profile_id);

    return await generateSubscriptionResponse(request, profile);

  } catch (error) {
    console.error(`Failed to generate subscription for profile ${params.profile_id}:`, error);
    return new Response('Failed to generate subscription', { status: 500 });
  }
}
"""