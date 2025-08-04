import { jsonResponse, errorResponse } from './utils/response';
import { requireAuth } from './utils/auth';
import { NodeDataAccess } from './utils/d1-data-access';
import { Env } from '@shared/types';

export async function handleNodesClearAll(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    await NodeDataAccess.clearAll(env);

    return jsonResponse({
      success: true,
      message: '所有节点已成功清空'
    });
  } catch (error) {
    console.error('清空所有节点失败:', error);
    return errorResponse('清空所有节点失败');
  }
}
