// src/app/api/subscriptions/update/[id]/route.ts

export const runtime = 'edge';

import { NextResponse, NextRequest } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { Subscription } from '@/types';

// 定义订阅状态的类型
interface SubscriptionStatus {
  status: 'success' | 'error';
  nodeCount: number;
  lastUpdated: string;
  error?: string;
}

const getKV = () => {
  // @ts-ignore
  return process.env.KV as KVNamespace;
};

// 基础的 Base64 解码函数
function base64Decode(str: string): string {
    try {
        return atob(str.replace(/_/g, '/').replace(/-/g, '+'));
    } catch (e) {
        return ''; // 如果解码失败，返回空字符串
    }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const authenticatedUser = await authenticateUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  const { id } = params;
  const KV = getKV();

  try {
    const subJson = await KV.get(`subscription:${id}`);
    if (!subJson) {
      return NextResponse.json({ error: '订阅不存在' }, { status: 404 });
    }
    const subscription: Subscription = JSON.parse(subJson);

    const response = await fetch(subscription.url, {
        headers: { 'User-Agent': 'ProSub/1.0' }
    });

    if (!response.ok) {
      throw new Error(`请求订阅链接失败，状态码: ${response.status}`);
    }

    const content = await response.text();
    const decodedContent = base64Decode(content);
    const nodeCount = decodedContent.split(/[\r\n]+/).filter(Boolean).length;

    const status: SubscriptionStatus = {
      status: 'success',
      nodeCount: nodeCount,
      lastUpdated: new Date().toISOString(),
    };
    
    // 将更新状态存入 KV，键名为 sub-status:[id]
    await KV.put(`sub-status:${id}`, JSON.stringify(status));

    return NextResponse.json(status);

  } catch (error) {
    const status: SubscriptionStatus = {
        status: 'error',
        nodeCount: 0,
        lastUpdated: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
    };
    await KV.put(`sub-status:${id}`, JSON.stringify(status));
    
    console.error(`Failed to update subscription ${id}:`, error);
    return NextResponse.json(status, { status: 500 });
  }
}