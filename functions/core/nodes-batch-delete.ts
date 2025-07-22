import { jsonResponse, errorResponse } from './utils/response';
import { parse } from 'cookie';

export async function handleNodesBatchDelete(request: Request, env: Env): Promise<Response> {
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
    const { ids } = (await request.json()) as { ids: string[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse('请求体中需要提供一个包含节点 ID 的数组', 400);
    }

    const KV = env.KV;
    
    const deletePromises = ids.map(id => KV.delete(`node:${id}`));
    
    await Promise.all(deletePromises);

    const nodeIndexJson = await KV.get('_index:nodes');
    const nodeIds = nodeIndexJson ? JSON.parse(nodeIndexJson) : [];
    const updatedNodeIds = nodeIds.filter((nodeId: string) => !ids.includes(nodeId));
    await KV.put('_index:nodes', JSON.stringify(updatedNodeIds));

    return jsonResponse({ message: `${ids.length} 个节点已成功删除` });

  } catch (error) {
    console.error('Failed to batch delete nodes:', error);
    return errorResponse('批量删除节点时发生错误');
  }
}
