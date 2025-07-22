import { jsonResponse, errorResponse } from './utils/response';
import { Node, Env } from '@shared/types';

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
      if (node.healthStatus) {
        nodeStatuses[nodeId] = node.healthStatus;
      }
    }
    return jsonResponse(nodeStatuses);
  } catch (error) {
    console.error('Failed to fetch node statuses:', error);
    return errorResponse('获取订阅状态失败');
  }
}
