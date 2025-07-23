import { jsonResponse, errorResponse } from './utils/response';
import { hashPassword, comparePassword } from './utils/crypto';
import { Env, User } from '@shared/types';
import { parse } from 'cookie';

const ADMIN_USER_KEY = 'ADMIN_USER';

async function getAdminUser(env: Env): Promise<User | null> {
  const userJson = await env.KV.get(ADMIN_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
}

async function putAdminUser(env: Env, user: User): Promise<void> {
  await env.KV.put(ADMIN_USER_KEY, JSON.stringify(user));
}

export async function handleUserChangePassword(request: Request, env: Env): Promise<Response> {
  const cookies = parse(request.headers.get('Cookie') || '');
  const token = cookies.auth_token;

  if (!token) {
    return errorResponse('未授权', 401);
  }

  const userId = await env.KV.get(`user_session:${token}`);

  if (!userId) {
    return errorResponse('未授权', 401);
  }

  let adminUser = await getAdminUser(env);

  if (!adminUser || adminUser.id !== userId) {
    return errorResponse('未授权', 401);
  }

  try {
    const { oldPassword, newPassword } = (await request.json()) as { oldPassword?: string; newPassword?: string };

    if (!newPassword || newPassword.length < 6) {
      return errorResponse('新密码至少需要6个字符', 400);
    }

    // If it's the first login (default password not changed), oldPassword is not required
    if (adminUser.defaultPasswordChanged) {
      if (!oldPassword) {
        return errorResponse('旧密码不能为空', 400);
      }
      const isOldPasswordValid = await comparePassword(oldPassword, adminUser.password || '');
      if (!isOldPasswordValid) {
        return errorResponse('旧密码不正确', 401);
      }
    }

    adminUser.password = await hashPassword(newPassword);
    adminUser.defaultPasswordChanged = true;
    await putAdminUser(env, adminUser);

    return jsonResponse({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码失败:', error);
    return errorResponse('修改密码失败');
  }
}