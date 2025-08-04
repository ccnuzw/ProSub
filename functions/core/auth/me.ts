import { jsonResponse, errorResponse } from '../utils/response';
import { requireAuth } from '../utils/auth';
import { Env } from '@shared/types';

export async function handleMeGet(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  // authResult 是用户对象
  const user = authResult;

  return jsonResponse({
    id: user.id,
    username: user.username,
    role: user.role
  });
}