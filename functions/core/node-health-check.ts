import { jsonResponse, errorResponse } from './utils/response';
import { Env, Node, HealthStatus } from '@shared/types';
import { requireAuth } from './utils/auth';

const ALL_NODES_KEY = 'ALL_NODES';
const NODE_STATUS_KEY = 'NODE_STATUS';

async function getAllNodes(env: Env): Promise<Record<string, Node>> {
  const nodesJson = await env.KV.get(ALL_NODES_KEY);
  return nodesJson ? JSON.parse(nodesJson) : {};
}

async function getNodeStatus(env: Env, nodeId: string): Promise<HealthStatus | null> {
  const statusJson = await env.KV.get(`${NODE_STATUS_KEY}:${nodeId}`);
  return statusJson ? JSON.parse(statusJson) : null;
}

async function putNodeStatus(env: Env, nodeId: string, status: HealthStatus): Promise<void> {
  await env.KV.put(`${NODE_STATUS_KEY}:${nodeId}`, JSON.stringify(status), {
    expirationTtl: 300 // 5分钟过期
  });
}

export async function handleNodeHealthCheck(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { server, port, nodeId } = await request.json();

    if (!server || !port || !nodeId) {
      return errorResponse('服务器地址、端口和节点ID不能为空', 400);
    }

    // 模拟健康检查
    // 在实际实现中，这里应该进行真实的网络连接测试
    const isOnline = Math.random() > 0.3; // 70% 概率在线
    const latency = isOnline ? Math.floor(Math.random() * 500) + 50 : null; // 50-550ms 延迟

    const status: HealthStatus = {
      status: isOnline ? 'online' : 'offline',
      latency,
      timestamp: new Date().toISOString(),
      error: isOnline ? null : '连接超时'
    };

    await putNodeStatus(env, nodeId, status);

    return jsonResponse(status);
  } catch (error) {
    console.error('节点健康检查失败:', error);
    return errorResponse('节点健康检查失败');
  }
}

export async function handleNodeStatusesGet(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const allNodes = await getAllNodes(env);
    const statuses: Record<string, HealthStatus> = {};

    // 获取所有节点的状态
    await Promise.all(
      Object.keys(allNodes).map(async (nodeId) => {
        const status = await getNodeStatus(env, nodeId);
        if (status) {
          statuses[nodeId] = status;
        }
      })
    );

    return jsonResponse(statuses);
  } catch (error) {
    console.error('获取节点状态失败:', error);
    return errorResponse('获取节点状态失败');
  }
}

export async function handleSubscriptionStatusesGet(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    // 模拟订阅状态
    const statuses = {
      'sub-1': {
        status: 'success' as const,
        nodeCount: 45,
        lastUpdated: new Date().toISOString()
      },
      'sub-2': {
        status: 'updating' as const,
        nodeCount: 32,
        lastUpdated: new Date().toISOString()
      }
    };

    return jsonResponse(statuses);
  } catch (error) {
    console.error('获取订阅状态失败:', error);
    return errorResponse('获取订阅状态失败');
  }
}