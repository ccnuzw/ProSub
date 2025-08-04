import { jsonResponse, errorResponse } from './utils/response';
import { Node, HealthStatus, Env } from '@shared/types';

const ALL_NODES_KEY = 'ALL_NODES';

async function getAllNodes(env: Env): Promise<Record<string, Node>> {
  const nodesJson = await env.KV.get(ALL_NODES_KEY);
  return nodesJson ? JSON.parse(nodesJson) : {};
}

export async function handleNodeStatuses(request: Request, env: Env): Promise<Response> {
  try {
    const allNodes = await getAllNodes(env);
    const nodeStatuses: Record<string, HealthStatus> = {};

    for (const nodeId in allNodes) {
      const node = allNodes[nodeId];
      // 如果节点有健康状态，使用它；否则设置为未知状态
      if (node.healthStatus) {
        nodeStatuses[nodeId] = node.healthStatus;
      } else {
        // 为没有状态的节点设置默认状态
        nodeStatuses[nodeId] = {
          status: 'unknown',
          nodeId: nodeId,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    console.log('返回节点状态:', Object.keys(nodeStatuses).length, '个节点');
    return jsonResponse(nodeStatuses);
  } catch (error) {
    console.error('获取节点状态失败:', error);
    return errorResponse('获取节点状态失败');
  }
}
