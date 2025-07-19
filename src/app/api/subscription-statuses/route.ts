// src/app/api/subscription-statuses/route.ts

export const runtime = 'edge';

import { NextResponse } from 'next/server';

const getKV = () => {
  // @ts-ignore
  return process.env.KV as KVNamespace;
};

export async function GET() {
  try {
    const KV = getKV();
    const statusList = await KV.list({ prefix: 'sub-status:' });
    
    const statuses: Record<string, any> = {};
    await Promise.all(
      statusList.keys.map(async ({ name }) => {
        const subId = name.replace('sub-status:', '');
        const statusJson = await KV.get(name);
        if (statusJson) {
          statuses[subId] = JSON.parse(statusJson);
        }
      })
    );
    return NextResponse.json(statuses);
  } catch (error) {
    console.error('Failed to fetch subscription statuses:', error);
    return NextResponse.json({ error: '获取订阅状态失败' }, { status: 500 });
  }
}