import { authenticateUser } from './lib/auth';

interface Env {
  KV: KVNamespace;
}

export async function handleNodesBatchDelete(request: Request, env: Env): Promise<Response> {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ message: '未授权' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { ids } = (await request.json()) as { ids: string[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ message: '请求体中需要提供一个包含节点 ID 的数组' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const KV = env.KV;
    
    const deletePromises = ids.map(id => KV.delete(`node:${id}`));
    
    await Promise.all(deletePromises);

    return new Response(JSON.stringify({ message: `${ids.length} 个节点已成功删除` }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Failed to batch delete nodes:', error);
    return new Response(JSON.stringify({ error: '批量删除节点时发生错误' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
