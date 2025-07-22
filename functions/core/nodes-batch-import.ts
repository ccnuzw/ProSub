import { jsonResponse, errorResponse } from './utils/response';
import { parse } from 'cookie';

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

    const KV = env.KV;
    const nodeList = await KV.list({ prefix: 'node:' });
    const existingNodesJson = await Promise.all(
      nodeList.keys.map(async ({ name }) => KV.get(name))
    );
    const existingNodes: Node[] = existingNodesJson.filter(Boolean).map(json => JSON.parse(json as string));

    const existingNodeSet = new Set(
      existingNodes.map(node => `${node.server}:${node.port}:${node.password || ''}`)
    );

    let importedCount = 0;
    let skippedCount = 0;
    const putPromises: Promise<any>[] = [];
    const newIds: string[] = [];

    for (const node of nodes) {
      if (node && node.server && node.port) {
        const uniqueKey = `${node.server}:${node.port}:${node.password || ''}`;

        if (!existingNodeSet.has(uniqueKey)) {
          const newNode = {
            id: crypto.randomUUID(),
            ...node
          } as Node;
          newIds.push(newNode.id);
          putPromises.push(KV.put(`node:${newNode.id}`, JSON.stringify(newNode)));
          existingNodeSet.add(uniqueKey);
          importedCount++;
        } else {
          skippedCount++;
        }
      }
    }

    if (putPromises.length > 0) {
      await Promise.all(putPromises);
      const nodeIndexJson = await KV.get('_index:nodes');
      const nodeIds = nodeIndexJson ? JSON.parse(nodeIndexJson) : [];
      const updatedNodeIds = [...nodeIds, ...newIds];
      await KV.put('_index:nodes', JSON.stringify(updatedNodeIds));
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