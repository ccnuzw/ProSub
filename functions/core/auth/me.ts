import { jsonResponse, errorResponse } from '../utils/response';
import { parse } from 'cookie';
import { Env, User } from '@shared/types';

const ADMIN_USER_KEY = 'ADMIN_USER';

async function getAdminUser(env: Env): Promise<User | null> {
  const userJson = await env.KV.get(ADMIN_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
}

export async function handleMe(request: Request, env: Env): Promise<Response> {
  try {
    const cookies = parse(request.headers.get('Cookie') || '');
    const token = cookies.auth_token;

    if (!token) {
      return errorResponse('未授权', 401);
    }

    const userId = await env.KV.get(`user_session:${token}`);

    if (!userId) {
      return errorResponse('未授权', 401);
    }

    const adminUser = await getAdminUser(env);

    if (!adminUser || adminUser.id !== userId) {
      return errorResponse('未授权', 401);
    }

    // Return user data without sensitive information like password
    return jsonResponse({ id: adminUser.id, name: adminUser.name, defaultPasswordChanged: adminUser.defaultPasswordChanged });
  } catch (error) {
    console.error('获取当前用户失败:', error);
    return errorResponse('获取当前用户失败');
  }
}