import { jsonResponse, errorResponse } from './utils/response';
import { requireAuth } from './utils/auth';
import { NodeDataAccess } from './utils/d1-data-access';
import { Env, Node } from '@shared/types';

export async function handleNodesBatchImport(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { nodes } = await request.json();
    
    if (!Array.isArray(nodes)) {
      return errorResponse('节点数据格式错误', 400);
    }

    const results = [];
    const errors = [];

    for (const node of nodes) {
      try {
        const createdNode = await NodeDataAccess.create(env, node);
        results.push(createdNode);
      } catch (error) {
        console.error(`创建节点失败: ${node.name}`, error);
        errors.push({
          node: node.name,
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
    }

    return jsonResponse({
      success: true,
      created: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    console.error('批量导入节点失败:', error);
    return errorResponse('批量导入节点失败');
  }
}