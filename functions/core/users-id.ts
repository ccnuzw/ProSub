import { jsonResponse, errorResponse } from '../utils/response';
import { requireAuth } from '../utils/auth';
import { UserDataAccess } from '../utils/d1-data-access';
import { Env } from '@shared/types';

export async function handleUserUpdate(request: Request, env: Env, id: string): Promise<Response> {
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
      return errorResponse('新密码长度不能少于6位', 400);
    }

    // 获取当前用户信息
    const currentUser = await UserDataAccess.getById(env, id);
    if (!currentUser) {
      return errorResponse('用户不存在', 404);
    }

    // 验证当前密码
    if (currentUser.password !== currentPassword) {
      return errorResponse('当前密码错误', 400);
    }

    // 更新密码
    const updatedUser = await UserDataAccess.update(env, id, {
      password: newPassword
    });

    return jsonResponse({
      message: '密码修改成功',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    return errorResponse('修改密码失败');
  }
}