import { jsonResponse, errorResponse } from '../utils/response';
import { UserDataAccess } from '../utils/d1-data-access';
import { User, Env } from '@shared/types';

const ADMIN_USER_KEY = 'ADMIN_USER';

async function createAdminUser(env: Env): Promise<User> {
  const adminUser: User = {
    id: 'admin',
    username: 'admin',
    password: 'admin123', // 默认密码，首次登录后需要修改
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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

    // 检查管理员用户是否存在
    let adminUser = await UserDataAccess.getByUsername(env, 'admin');
    
    // 如果管理员用户不存在，创建默认用户
    if (!adminUser) {
      adminUser = await createAdminUser(env);
    }

    if (username !== adminUser.username || password !== adminUser.password) {
      return errorResponse('用户名或密码错误', 401);
    }

    // 生成会话令牌
    const sessionToken = crypto.randomUUID();
    const sessionData = {
      userId: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时过期
    };

    // 存储会话数据到KV（用于会话管理）
    await env.KV.put(`session:${sessionToken}`, JSON.stringify(sessionData), {
      expirationTtl: 24 * 60 * 60 // 24小时
    });

    // 设置Cookie
    const cookie = `session=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${24 * 60 * 60}; Path=/`;

    return jsonResponse({
      id: adminUser.id,
      username: adminUser.username,
      role: adminUser.role
    }, {
      'Set-Cookie': cookie
    });
  } catch (error) {
    console.error('登录失败:', error);
    return errorResponse('登录失败');
  }
}