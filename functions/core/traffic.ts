import { jsonResponse, errorResponse } from './utils/response';
import { requireAuth } from './utils/auth';
import { Env } from '../../packages/shared/types';

export async function handleTrafficGet(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  const { searchParams } = new URL(request.url);
  const granularity = searchParams.get('granularity') || 'day'; // 'day', 'week', 'month'
  const profileId = searchParams.get('profileId'); // Optional: filter by profile

  try {
    // TODO: 实现TrafficDataAccess
    // 暂时返回空数组
    return jsonResponse([]);
  } catch (error) {
    console.error('获取流量记录失败:', error);
    return errorResponse('获取流量记录失败');
  }
}
