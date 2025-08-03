import { jsonResponse, errorResponse } from './utils/response';
import { Env, Node, HealthStatus } from '@shared/types';
import { requireAuth } from './utils/auth';
import { NodeDataAccess } from './utils/data-access';

const NODE_STATUS_KEY = 'NODE_STATUS';

async function getNodeStatus(env: Env, nodeId: string): Promise<HealthStatus | null> {
  const statusJson = await env.KV.get(`${NODE_STATUS_KEY}:${nodeId}`);
  return statusJson ? JSON.parse(statusJson) : null;
}

async function putNodeStatus(env: Env, nodeId: string, status: HealthStatus): Promise<void> {
  await env.KV.put(`${NODE_STATUS_KEY}:${nodeId}`, JSON.stringify(status), {
    expirationTtl: 300 // 5分钟过期
  });
}

// 单个节点健康检查
export async function handleSingleNodeHealthCheck(request: Request, env: Env, nodeId: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    // 获取节点信息
    const node = await NodeDataAccess.getById(env, nodeId);
    if (!node) {
      return errorResponse('节点不存在', 404);
    }

    // 设置检查中状态
    const checkingStatus: HealthStatus = {
      nodeId,
      status: 'checking',
      lastChecked: new Date().toISOString()
    };
    await putNodeStatus(env, nodeId, checkingStatus);

    // 模拟健康检查（在实际实现中，这里应该进行真实的网络连接测试）
    const isOnline = Math.random() > 0.3; // 70% 概率在线
    const latency = isOnline ? Math.floor(Math.random() * 500) + 50 : null; // 50-550ms 延迟

    const status: HealthStatus = {
      nodeId,
      status: isOnline ? 'online' : 'offline',
      latency,
      lastChecked: new Date().toISOString(),
      error: isOnline ? null : '连接超时'
    };

    await putNodeStatus(env, nodeId, status);

    return jsonResponse(status);
  } catch (error) {
    console.error('节点健康检查失败:', error);
    return errorResponse('节点健康检查失败');
  }
}

// 批量节点健康检查
export async function handleBatchNodeHealthCheck(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const allNodes = await NodeDataAccess.getAll(env);
    const nodeIds = Object.keys(allNodes);
    
    if (nodeIds.length === 0) {
      return jsonResponse({ message: '没有节点需要检查' });
    }

    // 为所有节点设置检查中状态
    const checkingPromises = nodeIds.map(async (nodeId) => {
      const checkingStatus: HealthStatus = {
        nodeId,
        status: 'checking',
        lastChecked: new Date().toISOString()
      };
      await putNodeStatus(env, nodeId, checkingStatus);
    });

    await Promise.all(checkingPromises);

    // 模拟批量检查结果
    const results = await Promise.all(
      nodeIds.map(async (nodeId) => {
        const isOnline = Math.random() > 0.3;
        const latency = isOnline ? Math.floor(Math.random() * 500) + 50 : null;

        const status: HealthStatus = {
          nodeId,
          status: isOnline ? 'online' : 'offline',
          latency,
          lastChecked: new Date().toISOString(),
          error: isOnline ? null : '连接超时'
        };

        await putNodeStatus(env, nodeId, status);
        return status;
      })
    );

    return jsonResponse({
      message: `已检查 ${nodeIds.length} 个节点`,
      results
    });
  } catch (error) {
    console.error('批量节点健康检查失败:', error);
    return errorResponse('批量节点健康检查失败');
  }
}

export async function handleNodeStatusesGet(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const allNodes = await NodeDataAccess.getAll(env);
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