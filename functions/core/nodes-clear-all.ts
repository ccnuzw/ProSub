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

export async function handleNodesClearAll(request: Request, env: Env): Promise<Response> {
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
    await putAllNodes(env, {});

    return jsonResponse({ message: '所有节点已清空' });

  } catch (error) {
    console.error('清空节点失败:', error);
    return errorResponse('清空节点失败');
  }
}
