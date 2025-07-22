import { jsonResponse, errorResponse } from './utils/response';
import { Node, Env } from '@shared/types';

const ALL_NODES_KEY = 'ALL_NODES';

async function getAllNodes(env: Env): Promise<Record<string, Node>> {
  const nodesJson = await env.KV.get(ALL_NODES_KEY);
  return nodesJson ? JSON.parse(nodesJson) : {};
}

async function putAllNodes(env: Env, nodes: Record<string, Node>): Promise<void> {
  await env.KV.put(ALL_NODES_KEY, JSON.stringify(nodes));
}

interface NodeRequest {
  name: string;
  server: string;
  port: number;
  password?: string;
  type: 'ss' | 'ssr' | 'vmess' | 'vless' | 'trojan' | 'socks5' | 'anytls' | 'tuic' | 'hysteria' | 'hysteria2' | 'vless-reality';
}

export async function handleNodesGet(request: Request, env: Env): Promise<Response> {
  try {
    const allNodes = await getAllNodes(env);
    return jsonResponse(Object.values(allNodes));
  } catch (error) {
    console.error('Failed to fetch nodes:', error);
    return errorResponse('Failed to fetch nodes');
  }
}

export async function handleNodesPost(request: Request, env: Env): Promise<Response> {
  try {
    const { name, server, port, password, type } = (await request.json()) as NodeRequest;
    const id = crypto.randomUUID();
    const newNode: Node = { id, name, server, port, password, type };

    const allNodes = await getAllNodes(env);
    allNodes[id] = newNode;
    await putAllNodes(env, allNodes);

    return jsonResponse(newNode);
  } catch (error) {
    console.error('Failed to create node:', error);
    return errorResponse('Failed to create node');
  }
}
