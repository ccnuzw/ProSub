import { jsonResponse, errorResponse } from '../../utils/response';
import { UserDataAccess } from '../../utils/d1-data-access';
import { Env, User } from '@shared/types';
import { parse, serialize } from 'cookie';
import { createHash } from 'crypto';

async function createAdminUser(env: Env): Promise<User> {
  const adminUser: User = {
    id: 'admin',
    username: 'admin',
    password: 'admin123',
    role: 'admin'
  };

  await UserDataAccess.create(env, adminUser);
  return adminUser;
}

export async function handleLogin(request: Request, env: Env): Promise<Response> {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return errorResponse('用户名和密码不能为空', 400);
    }

    // 检查是否存在管理员用户，如果不存在则创建
    let user = await UserDataAccess.getByUsername(env, username);
    
    if (!user) {
      // 如果是首次登录，创建默认管理员账户
      if (username === 'admin' && password === 'admin123') {
        user = await createAdminUser(env);
      } else {
        return errorResponse('用户名或密码错误', 401);
      }
    } else {
      // 验证密码
      if (user.password !== password) {
        return errorResponse('用户名或密码错误', 401);
      }
    }

    // 生成会话令牌
    const sessionToken = crypto.randomUUID();
    const sessionData = {
      userId: user.id,
      username: user.username,
      role: user.role,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时过期
    };

    // 存储会话数据
    await env.KV.put(`session:${sessionToken}`, JSON.stringify(sessionData), {
      expirationTtl: 86400 // 24小时
    });

    // 设置Cookie
    const cookie = serialize('session', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 86400,
      path: '/'
    });

    return jsonResponse({
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    }, 200, {
      'Set-Cookie': cookie
    });

  } catch (error) {
    console.error('登录失败:', error);
    return errorResponse('登录失败');
  }
}