// src/app/sub/[alias]/route.ts

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { Profile } from '@/types';
import { generateSubscriptionResponse } from '@/lib/subscription-generator';

const getKV = () => {
  // @ts-ignore
  return process.env.KV as KVNamespace;
};

async function recordTraffic(KV: KVNamespace, profileId: string, alias: string) {
  try {
    const timestamp = new Date().toISOString();
    const key = `traffic:${profileId}:${timestamp}`;
    await KV.put(key, JSON.stringify({ timestamp, profileId, alias }));
  } catch (error) {
    console.error('Failed to record traffic:', error);
  }
}

export async function GET(request: NextRequest, { params }: { params: { alias: string } }) {
  try {
    const KV = getKV();
    const alias = params.alias;

    // 1. Find profile_id from alias
    const idRecord = await KV.get(`alias:${alias}`);
    if (!idRecord) {
      return new Response('Subscription alias not found', { status: 404 });
    }
    const { id: profileId } = JSON.parse(idRecord);

    // 2. Get the full profile object
    const profileJson = await KV.get(`profile:${profileId}`);
    if (!profileJson) {
      return new Response('Profile data not found for the alias', { status: 404 });
    }
    const profile: Profile = JSON.parse(profileJson);

    // 3. Record traffic
    await recordTraffic(KV, profileId, alias);

    // 4. Generate and return the subscription content
    return await generateSubscriptionResponse(request, profile);

  } catch (error) {
    console.error(`Failed to generate subscription for alias ${params.alias}:`, error);
    return new Response('Failed to generate subscription', { status: 500 });
  }
}
