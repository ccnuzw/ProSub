// src/app/api/node-health-check/route.ts

export const runtime = 'edge';

import { NextResponse, NextRequest } from 'next/server';
import { HealthStatus } from '@/types';

const getKV = () => {
  // @ts-ignore
  return process.env.KV as KVNamespace;
};

// --- Promise-based timeout helper ---
function promiseWithTimeout<T>(promise: Promise<T>, ms: number, timeoutError = new Error('Connection timed out')): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => {
            reject(timeoutError);
        }, ms);
    });
    return Promise.race([promise, timeout]);
}

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

  let socket: any = null;
  try {
    const startTime = Date.now();

    // 创建一个 TCP 连接的 Promise
    const connectPromise = new Promise<any>((resolve, reject) => {
        try {
            // @ts-ignore - connect is a valid API in Cloudflare Workers environment
            const s = connect({ hostname: server, port: port });
            resolve(s);
        } catch (e) {
            reject(e);
        }
    });

    // 使用 5 秒的超时来竞赛连接 Promise
    socket = await promiseWithTimeout(connectPromise, 5000);
    
    // 如果连接成功，立即关闭
    await socket.close();
    
    const endTime = Date.now();
    
    healthStatus.status = 'online';
    healthStatus.latency = endTime - startTime;

  } catch (error) {
    // 如果 socket 已经创建但后续出错，确保它被关闭
    if (socket) {
      try {
        await socket.close();
      } catch (closeError) {
        // Ignore errors on close after a failure
      }
    }
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