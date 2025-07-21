import { HealthStatus } from './types';

interface Env {
  KV: KVNamespace;
}

export async function handleNodeHealthCheck(request: Request, env: Env): Promise<Response> {
  const { server, port, nodeId } = (await request.json()) as { server: string, port: number, nodeId: string };

  if (!server || !port || !nodeId) {
    return new Response(JSON.stringify({ error: 'Server, port, and nodeId are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const KV = env.KV;
  const healthStatus: HealthStatus = {
    status: 'offline',
    timestamp: new Date().toISOString(),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

  try {
    const startTime = Date.now();
    
    await fetch(`http://${server}:${port}`, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'ProSub Health Check/1.0'
      }
    });

    const endTime = Date.now();
    
    healthStatus.status = 'online';
    healthStatus.latency = endTime - startTime;

  } catch (error) {
    healthStatus.status = 'offline';
    if (error instanceof Error) {
        healthStatus.error = error.message;
    } else {
        healthStatus.error = String(error);
    }
  } finally {
    clearTimeout(timeoutId);
  }

  await KV.put(`node-status:${nodeId}`, JSON.stringify(healthStatus));

  return new Response(JSON.stringify(healthStatus), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
