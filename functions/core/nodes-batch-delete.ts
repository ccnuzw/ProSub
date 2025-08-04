import { jsonResponse, errorResponse } from './utils/response';
import { requireAuth } from './utils/auth';
import { NodeDataAccess } from './utils/d1-data-access';
import { Env } from '@shared/types';

export async function handleNodesBatchDelete(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { ids } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse('请提供要删除的节点ID列表', 400);
    }

    const deletedCount = await NodeDataAccess.batchDelete(env, ids);

    return jsonResponse({
      success: true,
      deletedCount,
      message: `成功删除 ${deletedCount} 个节点`
    });
  } catch (error) {
    console.error('批量删除节点失败:', error);
    return errorResponse('批量删除节点失败');
  }
}
