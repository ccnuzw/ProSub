import { jsonResponse, errorResponse } from './utils/response';
import { Node, HealthStatus, Env } from '@shared/types';

const ALL_NODES_KEY = 'ALL_NODES';

async function getAllNodes(env: Env): Promise<Record<string, Node>> {
  const nodesJson = await env.KV.get(ALL_NODES_KEY);
  return nodesJson ? JSON.parse(nodesJson) : {};
}

async function putAllNodes(env: Env, nodes: Record<string, Node>): Promise<void> {
  await env.KV.put(ALL_NODES_KEY, JSON.stringify(nodes));
}

export async function handleNodeHealthCheck(request: Request, env: Env): Promise<Response> {
  try {
    const { nodeId } = (await request.json()) as { nodeId: string };

    if (!nodeId) {
      return errorResponse('NodeId is required', 400);
    }

    const allNodes = await getAllNodes(env);
    const node = allNodes[nodeId];

    if (!node) {
      return errorResponse('Node not found', 404);
    }

    const healthStatus: HealthStatus = {
      status: 'offline',
      timestamp: new Date().toISOString(),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

    try {
      const startTime = Date.now();
      
      await fetch(`http://${node.server}:${node.port}`, {
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
        // Check for specific error messages that indicate unsupported operations in Workers
        if (error.message.includes('network connection') || error.message.includes('unsupported protocol')) {
          healthStatus.error = `Health check failed: Direct connection to ${node.type} node is not fully supported from Cloudflare Workers.`;
        } else if (error.name === 'AbortError') {
          healthStatus.error = 'Health check timed out.';
        } else {
          healthStatus.error = error.message;
        }
      } else {
        healthStatus.error = String(error);
      }
    } finally {
      clearTimeout(timeoutId);
    }

    node.healthStatus = healthStatus;
    await putAllNodes(env, allNodes);

    return jsonResponse(healthStatus);
  } catch (error) {
    console.error('Unhandled error in handleNodeHealthCheck:', error);
    if (error instanceof Error) {
      return errorResponse(`Internal Server Error: ${error.message}`, 500);
    }
    return errorResponse('Internal Server Error', 500);
  }
}
