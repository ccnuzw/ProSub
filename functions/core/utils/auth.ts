import { errorResponse } from './response';
import { parse } from 'cookie';
import { Env } from '@shared/types';

export async function requireAuth(request: Request, env: Env): Promise<string | Response> {
  const cookies = parse(request.headers.get('Cookie') || '');
  const token = cookies.auth_token;

  if (!token) {
    return errorResponse('未授权', 401);
  }

  const userId = await env.KV.get(`user_session:${token}`);

  if (!userId) {
    return errorResponse('未授权', 401);
  }

  // 认证成功，返回用户ID
  return userId;
}