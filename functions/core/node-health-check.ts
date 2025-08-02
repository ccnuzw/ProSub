import { Env } from '@shared/types';
import { jsonResponse, errorResponse } from './utils/response';
import { requireAuth } from './utils/auth';

interface HealthCheckResult {
  status: 'online' | 'offline' | 'error';
  latency?: number;
  error?: string;
}

async function checkNodeHealth(node: any): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // 根据节点类型选择合适的健康检查方式
    let checkPromise: Promise<Response>;
    
    switch (node.type) {
      case 'http':
      case 'https':
        // 对于HTTP(S)节点，发送HEAD请求
        checkPromise = fetch(`http${node.type === 'https' ? 's' : ''}://${node.server}:${node.port}`, {
          method: 'HEAD',
          signal: AbortSignal.timeout(5000) // 5秒超时
        });
        break;
      default:
        // 对于其他类型的节点，尝试TCP连接检查
        // 在Cloudflare Workers环境中，我们使用简单的HTTP请求检查
        checkPromise = fetch(`http://${node.server}:${node.port}`, {
          method: 'HEAD',
          signal: AbortSignal.timeout(5000) // 5秒超时
        }).catch(() => {
          // 如果HTTP检查失败，尝试HTTPS
          return fetch(`https://${node.server}:${node.port}`, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
          });
        });
    }
    
    const response = await checkPromise;
    const latency = Date.now() - startTime;
    
    return {
      status: response.ok ? 'online' : 'offline',
      latency: response.ok ? latency : undefined,
      error: response.ok ? undefined : `HTTP ${response.status}`
    };
  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error(`Health check failed for node ${node.id}:`, error);
    
    return {
      status: 'offline',
      latency: latency,
      error: error.name === 'AbortError' ? 'Timeout' : error.message || 'Connection failed'
    };
  }
}

export async function handleNodeHealthCheck(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { id } = await request.json() as { id: string };
    const allNodesJson = await env.KV.get('ALL_NODES');
    const allNodes = allNodesJson ? JSON.parse(allNodesJson) : {};
    
    const node = allNodes[id];
    if (!node) {
      return errorResponse('Node not found', 404);
    }
    
    const result = await checkNodeHealth(node);
    return jsonResponse(result);
  } catch (error) {
    console.error('Failed to check node health:', error);
    return errorResponse('Failed to check node health');
  }
}

export async function handleBatchNodeHealthCheck(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const allNodesJson = await env.KV.get('ALL_NODES');
    const allNodes = allNodesJson ? JSON.parse(allNodesJson) : {};
    
    // 批量检查所有节点的健康状态
    const checkPromises = Object.entries(allNodes).map(async ([id, node]: [string, any]) => {
      const result = await checkNodeHealth(node);
      return { id, ...result };
    });
    
    const results = await Promise.all(checkPromises);
    const healthStatus: Record<string, HealthCheckResult> = {};
    
    results.forEach(result => {
      healthStatus[result.id] = {
        status: result.status,
        latency: result.latency,
        error: result.error
      };
    });
    
    return jsonResponse(healthStatus);
  } catch (error) {
    console.error('Failed to check nodes health in batch:', error);
    return errorResponse('Failed to check nodes health in batch');
  }
}