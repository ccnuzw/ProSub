import { authenticateUser } from './lib/auth';
import { Node } from './types';

interface Env {
  KV: KVNamespace;
}

export async function handleNodesBatchImport(request: Request, env: Env): Promise<Response> {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ message: '未授权' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { nodes } = (await request.json()) as { nodes: Node[] };

    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      return new Response(JSON.stringify({ message: '请求体中需要提供 nodes 数组' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
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

    for (const node of nodes) {
      if (node && node.server && node.port) {
        const uniqueKey = `${node.server}:${node.port}:${node.password || ''}`;

        if (!existingNodeSet.has(uniqueKey)) {
          const newNode = {
            id: crypto.randomUUID(),
            ...node
          } as Node;
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
    }

    return new Response(JSON.stringify({
      message: `成功导入 ${importedCount} 个节点，跳过 ${skippedCount} 个重复节点。`,
      importedCount,
      skippedCount,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('处理批量导入节点失败:', error);
    return new Response(JSON.stringify({ message: '处理批量导入节点失败' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}