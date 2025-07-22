import { jsonResponse, errorResponse } from './utils/response';
import { parse } from 'cookie';

export async function handleNodesClearAll(request: Request, env: Env): Promise<Response> {
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
    const KV = env.KV;
    const nodeList = await KV.list({ prefix: 'node:' });
    const deletePromises: Promise<any>[] = [];

    for (const key of nodeList.keys) {
      deletePromises.push(KV.delete(key.name));
    }

    await Promise.all(deletePromises);

    await KV.put('_index:nodes', JSON.stringify([]));

    return jsonResponse({ message: '所有节点已清空' });

  } catch (error) {
    console.error('清空节点失败:', error);
    return errorResponse('清空节点失败');
  }
}
