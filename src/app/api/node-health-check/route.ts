// src/app/api/node-health-check/route.ts

export const runtime = 'edge';

import { NextResponse, NextRequest } from 'next/server';
import { HealthStatus } from '@/types';

const getKV = () => {
  // @ts-ignore
  return process.env.KV as KVNamespace;
};

export async function POST(request: NextRequest) {
  const { server, port, nodeId } = (await request.json()) as { server: string, port: number, nodeId: string };

  if (!server || !port || !nodeId) {
    return NextResponse.json({ error: 'Server, port, and nodeId are required' }, { status: 400 });
  }

  const KV = getKV();
  const healthStatus: HealthStatus = {
    status: 'offline',
    timestamp: new Date().toISOString(),
  };

  try {
    const startTime = Date.now();
    // 使用 TCP 套接字进行连接测试，这比 HTTP HEAD 更通用
    // @ts-ignore - connect is a valid API in Cloudflare Workers environment
    const socket = connect({ hostname: server, port: port });
    // 我们只需要知道能否建立连接，所以直接关闭它
    await socket.close();
    
    const endTime = Date.now();
    
    healthStatus.status = 'online';
    healthStatus.latency = endTime - startTime; // 记录延迟

  } catch (error) {
    if (error instanceof Error) {
        healthStatus.error = error.message;
    } else {
        healthStatus.error = String(error);
    }
  }

  // 将包含延迟的健康状态存入 KV
  await KV.put(`node-status:${nodeId}`, JSON.stringify(healthStatus));

  return NextResponse.json(healthStatus);
}