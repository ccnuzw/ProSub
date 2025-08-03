import { jsonResponse, errorResponse } from './utils/response';
import { parse } from 'cookie';
import { Env, User } from '@shared/types';
import { requireAuth } from './utils/auth';

const ADMIN_USER_KEY = 'ADMIN_USER';

async function getAdminUser(env: Env): Promise<User | null> {
  const userJson = await env.KV.get(ADMIN_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
}

async function putAdminUser(env: Env, user: User): Promise<void> {
  await env.KV.put(ADMIN_USER_KEY, JSON.stringify(user));
}

export async function handleUserChangePassword(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return errorResponse('当前密码和新密码不能为空', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse('新密码长度至少6位', 400);
    }

    const adminUser = await getAdminUser(env);
    if (!adminUser) {
      return errorResponse('用户不存在', 404);
    }

    // 验证当前密码
    if (adminUser.password !== currentPassword) {
      return errorResponse('当前密码错误', 401);
    }

    // 更新密码
    adminUser.password = newPassword;
    adminUser.updatedAt = new Date().toISOString();
    await putAdminUser(env, adminUser);

    return jsonResponse({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码失败:', error);
    return errorResponse('修改密码失败');
  }
}