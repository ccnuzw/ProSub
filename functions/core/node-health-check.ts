import { jsonResponse, errorResponse } from './utils/response';
import { requireAuth } from './utils/auth';
import { NodeHealthDataAccess } from './utils/d1-data-access';
import { Env, HealthStatus } from '@shared/types';

const NODE_STATUS_KEY = 'node_status';

export async function handleSingleNodeHealthCheck(request: Request, env: Env, nodeId: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    // 设置检查中状态
    const checkingStatus: HealthStatus = {
      nodeId,
      status: 'checking',
      lastChecked: new Date().toISOString()
    };
    
    await NodeHealthDataAccess.update(env, checkingStatus);

    // 模拟实际的健康检查逻辑
    // 在这里可以集成真实的节点检查API，例如发送一个请求并根据响应判断状态和延迟
    const isOnline = Math.random() > 0.3; // 70% 几率在线
    const latency = isOnline ? Math.floor(Math.random() * 200) + 50 : undefined; // 50-250ms 延迟

    const status: HealthStatus = {
      nodeId,
      status: isOnline ? 'online' : 'offline',
      lastChecked: new Date().toISOString(),
      latency: latency
    };

    await NodeHealthDataAccess.update(env, status);

    return jsonResponse(status);
  } catch (error) {
    console.error(`健康检查失败 (节点 ${nodeId}):`, error);
    
    const errorStatus: HealthStatus = {
      nodeId,
      status: 'unknown',
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : '未知错误'
    };
    
    await NodeHealthDataAccess.update(env, errorStatus);
    
    return errorResponse('健康检查失败');
  }
}

export async function handleBatchNodeHealthCheck(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { nodeIds } = await request.json();
    
    if (!Array.isArray(nodeIds)) {
      return errorResponse('请提供节点ID列表', 400);
    }

    const results = [];
    const errors = [];

    for (const nodeId of nodeIds) {
      try {
        // 设置检查中状态
        const checkingStatus: HealthStatus = {
          nodeId,
          status: 'checking',
          lastChecked: new Date().toISOString()
        };
        
        await NodeHealthDataAccess.update(env, checkingStatus);

        // 模拟实际的健康检查逻辑
        // 在这里可以集成真实的节点检查API，例如发送一个请求并根据响应判断状态和延迟
        const isOnline = Math.random() > 0.3; // 70% 几率在线
        const latency = isOnline ? Math.floor(Math.random() * 200) + 50 : undefined; // 50-250ms 延迟

        const status: HealthStatus = {
          nodeId,
          status: isOnline ? 'online' : 'offline',
          lastChecked: new Date().toISOString(),
          latency: latency
        };

        await NodeHealthDataAccess.update(env, status);
        results.push(status);
      } catch (error) {
        console.error(`健康检查失败 (节点 ${nodeId}):`, error);
        
        const errorStatus: HealthStatus = {
          nodeId,
          status: 'unknown',
          lastChecked: new Date().toISOString(),
          error: error instanceof Error ? error.message : '未知错误'
        };
        
        await NodeHealthDataAccess.update(env, errorStatus);
        errors.push({ nodeId, error: errorStatus.error });
      }
    }

    return jsonResponse({
      success: true,
      checked: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    console.error('批量健康检查失败:', error);
    return errorResponse('批量健康检查失败');
  }
}

export async function handleNodeStatusesGet(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const allNodes = await NodeHealthDataAccess.getAll(env);
    const statuses: Record<string, HealthStatus> = {};

    // 获取所有节点的状态
    await Promise.all(
      Object.keys(allNodes).map(async (nodeId) => {
        const status = await NodeHealthDataAccess.getById(env, nodeId);
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