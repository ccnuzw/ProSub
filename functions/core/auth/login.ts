import { jsonResponse, errorResponse } from '../utils/response';
import { comparePassword } from '../utils/crypto';
import { Env, User } from '@shared/types';
import { serialize } from 'cookie';

const ADMIN_USER_KEY = 'ADMIN_USER';
const JWT_SECRET_KEY = 'JWT_SECRET';

async function getAdminUser(env: Env): Promise<User | null> {
  const userJson = await env.KV.get(ADMIN_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
}

async function putAdminUser(env: Env, user: User): Promise<void> {
  await env.KV.put(ADMIN_USER_KEY, JSON.stringify(user));
}

export async function handleLogin(request: Request, env: Env): Promise<Response> {
  try {
    const { name, password } = (await request.json()) as Pick<User, 'name' | 'password'>;

    if (!name || !password) {
      return errorResponse('用户名和密码不能为空', 400);
    }

    let adminUser = await getAdminUser(env);

    // If no admin user exists, create a default one
    if (!adminUser) {
      const defaultPasswordHash = await comparePassword('admin', ''); // This will always be false, just to get a hash
      adminUser = {
        id: crypto.randomUUID(),
        name: 'admin',
        password: await comparePassword('admin', 'admin') ? '' : await comparePassword('admin', 'admin'), // Placeholder, will be replaced by actual hash
        profiles: [],
        defaultPasswordChanged: false,
      };
      // Hash the default password 'admin'
      adminUser.password = await comparePassword('admin', 'admin') ? '' : await comparePassword('admin', 'admin'); // This is still wrong, need to hash 'admin'
      // Correct way to hash the default password
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode('admin' + adminUser.id); // Use ID as salt for initial hash
      const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);
      const hashHex = Array.prototype.map.call(new Uint8Array(hashBuffer), (x: number) => ('00' + x.toString(16)).slice(-2)).join('');
      adminUser.password = `${adminUser.id}:${hashHex}`;

      await putAdminUser(env, adminUser);
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, adminUser.password || '');

    if (adminUser.name !== name || !isPasswordValid) {
      return errorResponse('用户名或密码错误', 401);
    }

    // Generate a simple token (e.g., UUID) and store it in KV with user ID
    const token = crypto.randomUUID();
    await env.KV.put(`user_session:${token}`, adminUser.id, { expirationTtl: 3600 }); // Token valid for 1 hour

    const cookie = serialize('auth_token', token, {
      httpOnly: true,
      secure: env.ENVIRONMENT === 'production', // Use secure in production
      maxAge: 3600, // 1 hour
      path: '/',
    });

    return jsonResponse({ message: '登录成功', user: { id: adminUser.id, name: adminUser.name } }, 200, { 'Set-Cookie': cookie });

  } catch (error) {
    console.error('登录失败:', error);
    return errorResponse('登录失败');
  }
}