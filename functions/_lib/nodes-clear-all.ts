import { jsonResponse, errorResponse } from './utils/response';



export async function handleNodesClearAll(request: Request, env: Env): Promise<Response> {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
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

    return jsonResponse({ message: '所有节点已清空' });

  } catch (error) {
    console.error('清空节点失败:', error);
    return errorResponse('清空节点失败');
  }
}
