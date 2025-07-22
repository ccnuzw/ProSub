import { authenticateUser } from './lib/auth';

interface Env {
  KV: KVNamespace;
}

export async function handleNodesClearAll(request: Request, env: Env): Promise<Response> {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ message: '未授权' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const KV = env.KV;
    const nodeList = await KV.list({ prefix: 'node:' });
    const deletePromises: Promise<any>[] = [];

    for (const key of nodeList.keys) {
      deletePromises.push(KV.delete(key.name));
    }

    await Promise.all(deletePromises);

    return new Response(JSON.stringify({ message: '所有节点已清空' }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('清空节点失败:', error);
    return new Response(JSON.stringify({ message: '清空节点失败' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
