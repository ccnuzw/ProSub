import { jsonResponse, errorResponse } from '../../utils/response';
import { requireAuth } from '../../utils/auth';
import { Env } from '@shared/types';

export async function handleMe(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    return jsonResponse({
      id: authResult.id,
      username: authResult.username,
      role: authResult.role
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return errorResponse('获取用户信息失败');
  }
}