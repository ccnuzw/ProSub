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

export async function handleNodesBatchImport(request: Request, env: Env): Promise<Response> {
  const cookies = parse(request.headers.get('Cookie') || '');
  const token = cookies.auth_token;

  if (!token) {
    return errorResponse('未授权', 401);
  }

  const userJson = await env.KV.get(`user:${token}`);

  if (!userJson) {
    return errorResponse('未授权', 401);
  }

  try {
    const { nodes } = (await request.json()) as { nodes: Node[] };

    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      return errorResponse('请求体中需要提供 nodes 数组', 400);
    }

    const allNodes = await getAllNodes(env);
    const existingNodeSet = new Set(
      Object.values(allNodes).map(node => `${node.server}:${node.port}:${node.password || ''}`)
    );

    let importedCount = 0;
    let skippedCount = 0;

    for (const node of nodes) {
      if (node && node.server && node.port) {
        const uniqueKey = `${node.server}:${node.port}:${node.password || ''}`;

        if (!existingNodeSet.has(uniqueKey)) {
          const newNode = {
            id: crypto.randomUUID(),
            ...node
          } as Node;
          allNodes[newNode.id] = newNode;
          existingNodeSet.add(uniqueKey);
          importedCount++;
        } else {
          skippedCount++;
        }
      }
    }

    if (importedCount > 0) {
      await putAllNodes(env, allNodes);
    }

    return jsonResponse({
      message: `成功导入 ${importedCount} 个节点，跳过 ${skippedCount} 个重复节点。`,
      importedCount,
      skippedCount,
    });

  } catch (error) {
    console.error('处理批量导入节点失败:', error);
    return errorResponse('处理批量导入节点失败');
  }
}