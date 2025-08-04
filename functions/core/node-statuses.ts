import { jsonResponse, errorResponse } from './utils/response';
import { NodeHealthDataAccess } from './utils/d1-data-access';
import { Env } from '@shared/types';

export async function handleNodeStatuses(request: Request, env: Env): Promise<Response> {
  try {
    const nodeStatuses = await NodeHealthDataAccess.getAll(env);
    console.log('返回节点状态:', Object.keys(nodeStatuses).length, '个节点');
    return jsonResponse(nodeStatuses);
  } catch (error) {
    console.error('获取节点状态失败:', error);
    return errorResponse('获取节点状态失败');
  }
}
