import { jsonResponse, errorResponse } from './utils/response';
import { parse } from 'cookie';
import { Node, Env } from '@shared/types';

const ALL_NODES_KEY = 'ALL_NODES';

async function getAllNodes(env: Env): Promise<Record<string, Node>> {
  const nodesJson = await env.KV.get(ALL_NODES_KEY);
  return nodesJson ? JSON.parse(nodesJson) : {};
}

async function putAllNodes(env: Env, nodes: Record<string, Node>): Promise<void> {
  await env.KV.put(ALL_NODES_KEY, JSON.stringify(nodes));
}

export async function handleNodesBatchDelete(request: Request, env: Env): Promise<Response> {
  const cookies = parse(request.headers.get('Cookie') || '');
  const token = cookies.auth_token;

  if (!token) {
    return errorResponse('未授权', 401);
  }

  const userJson = await env.KV.get(`user_session:${token}`);

  if (!userJson) {
    return errorResponse('未授权', 401);
  }

  try {
    const { ids } = (await request.json()) as { ids: string[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse('请求体中需要提供一个包含节点 ID 的数组', 400);
    }

    const allNodes = await getAllNodes(env);
    let deletedCount = 0;

    for (const id of ids) {
      if (allNodes[id]) {
        delete allNodes[id];
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      await putAllNodes(env, allNodes);
    }

    return jsonResponse({ message: `${deletedCount} 个节点已成功删除` });

  } catch (error) {
    console.error('Failed to batch delete nodes:', error);
    return errorResponse('批量删除节点时发生错误');
  }
}
