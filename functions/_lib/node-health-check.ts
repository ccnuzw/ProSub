import { jsonResponse, errorResponse } from './utils/response';



export async function handleNodeHealthCheck(request: Request, env: Env): Promise<Response> {
  const { server, port, nodeId } = (await request.json()) as { server: string, port: number, nodeId: string };

  if (!server || !port || !nodeId) {
    return errorResponse('Server, port, and nodeId are required', 400);
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

  return jsonResponse(healthStatus);
}
