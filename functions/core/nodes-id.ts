import { jsonResponse, errorResponse } from './utils/response';
import { Node, Env } from '@shared/types';
import { requireAuth } from './utils/auth';

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

export async function handleNodeGet(request: Request, env: Env, id: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }
  
  try {
    const allNodes = await getAllNodes(env);
    const node = allNodes[id];
    if (!node) {
      return errorResponse('Node not found', 404);
    }
    return jsonResponse(node);
  } catch (error) {
    console.error(`Failed to fetch node ${id}:`, error);
    return errorResponse('Failed to fetch node');
  }
}

export async function handleNodePut(request: Request, env: Env, id: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { name, server, port, password, type } = (await request.json()) as NodeRequest;
    const updatedNode: Node = { id, name, server, port, password, type };
    
    const allNodes = await getAllNodes(env);
    if (!allNodes[id]) {
      return errorResponse('Node not found', 404);
    }
    allNodes[id] = updatedNode;
    await putAllNodes(env, allNodes);
    
    return jsonResponse(updatedNode);
  } catch (error) {
    console.error(`Failed to update node ${id}:`, error);
    return errorResponse('Failed to update node');
  }
}

export async function handleNodeDelete(request: Request, env: Env, id: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const allNodes = await getAllNodes(env);
    if (!allNodes[id]) {
      return errorResponse('Node not found', 404);
    }
    delete allNodes[id];
    await putAllNodes(env, allNodes);
    
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete node ${id}:`, error);
    return errorResponse('Failed to delete node');
  }
}