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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

  try {
    const startTime = Date.now();
    
    // 我们尝试访问一个虚构的 HTTP 端点，仅为测试端口连通性
    // 注意：即使是 vless/trojan 等非 http 协议，只要端口开放，fetch 就能建立 TCP 连接
    // 即使 fetch 最终因协议不匹配而失败（例如收到非HTTP响应），它也不会抛出网络层错误
    // 只有在端口不通或网络超时时，才会抛出 TypeError
    await fetch(`http://${server}:${port}`, {
      method: 'HEAD', // 使用 HEAD 请求，我们不关心响应体，只关心能否连接
      signal: controller.signal,
      headers: {
        'User-Agent': 'ProSub Health Check/1.0'
      }
    });

    const endTime = Date.now();
    
    healthStatus.status = 'online';
    healthStatus.latency = endTime - startTime;

  } catch (error) {
    // 只有在网络层面彻底失败（例如，连接被拒绝、超时、DNS解析失败）时，fetch才会抛出异常
    healthStatus.status = 'offline';
    if (error instanceof Error) {
        healthStatus.error = error.message;
    } else {
        healthStatus.error = String(error);
    }
  } finally {
    clearTimeout(timeoutId);
  }

  // 将健康状态存入 KV
  await KV.put(`node-status:${nodeId}`, JSON.stringify(healthStatus));

  return NextResponse.json(healthStatus);
}