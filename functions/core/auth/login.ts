import { jsonResponse, errorResponse } from '../utils/response';
import { parse, serialize } from 'cookie';
import { Env, User } from '@shared/types';

const ADMIN_USER_KEY = 'ADMIN_USER';

async function getAdminUser(env: Env): Promise<User | null> {
  const userJson = await env.KV.get(ADMIN_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
}

async function createAdminUser(env: Env): Promise<User> {
  const adminUser: User = {
    id: 'admin',
    username: 'admin',
    password: 'admin123', // 默认密码，首次登录后需要修改
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  await env.KV.put(ADMIN_USER_KEY, JSON.stringify(adminUser));
  return adminUser;
}

export async function handleLogin(request: Request, env: Env): Promise<Response> {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return errorResponse('用户名和密码不能为空', 400);
    }

    let adminUser = await getAdminUser(env);
    
    // 如果管理员用户不存在，创建默认用户
    if (!adminUser) {
      adminUser = await createAdminUser(env);
    }

    if (username !== adminUser.username || password !== adminUser.password) {
      return errorResponse('用户名或密码错误', 401);
    }

    // 生成会话令牌
    const token = crypto.randomUUID();
    const sessionExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7天过期
    
    // 存储会话
    await env.KV.put(`user_session:${token}`, adminUser.id, {
      expirationTtl: 7 * 24 * 60 * 60 // 7天过期
    });

    // 设置Cookie
    const cookie = serialize('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7天
      path: '/'
    });

    return jsonResponse({
      id: adminUser.id,
      username: adminUser.username,
      role: adminUser.role
    }, 200, {
      'Set-Cookie': cookie
    });
  } catch (error) {
    console.error('登录失败:', error);
    return errorResponse('登录失败');
  }
}