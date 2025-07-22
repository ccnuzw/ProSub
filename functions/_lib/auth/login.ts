import { User } from '../types';
import { jsonResponse, errorResponse } from '../utils/response';

import { hashPassword, comparePassword } from '../utils/crypto';
import { serialize } from 'cookie';

const getKV = (env: Env): KVNamespace => {
  if (env.KV) {
    return env.KV;
  }
  throw new Error("KV Namespace not found.");
}

// --- Admin User Creation Logic ---
async function ensureAdminUserExists(KV: KVNamespace) {
  const adminUserKey = 'user:admin';
  const adminUser = await KV.get(adminUserKey);
  if (!adminUser) {
    const hashedPassword = await hashPassword('admin');
    const newAdmin: User = { id: 'admin', name: 'admin', password: hashedPassword, profiles: [], defaultPasswordChanged: false };
    await KV.put(adminUserKey, JSON.stringify(newAdmin));
    console.log('Default admin user created.');
  }
}



export async function handleLogin(request: Request, env: Env): Promise<Response> {
  const { name, password } = (await request.json()) as { name: string; password: string };

  if (!name || !password) {
    return errorResponse('用户名和密码是必填项', 400);
  }

  const KV = getKV(env);
  
  await ensureAdminUserExists(KV);

  const userList = await KV.list({ prefix: 'user:' });
  const users = await Promise.all(
    userList.keys.map(async ({ name: keyName }: { name: string }) => {
      const userJson = await KV.get(keyName);
      return userJson ? JSON.parse(userJson) : null;
    })
  );
  const user = users.filter(Boolean).find((u: User) => u.name === name) as User | undefined;

  if (!user || !user.password) {
    return errorResponse('用户名或密码不正确', 401);
  }

  const passwordMatch = await comparePassword(password, user.password);

  if (!passwordMatch) {
    return errorResponse('用户名或密码不正确', 401);
  }

  const token = user.id;
  const cookie = serialize('auth_token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production', // Assuming NODE_ENV is available in Workers env
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });

  const responseBody: { message: string; user: { id: string; name: string }; forcePasswordChange?: boolean } = {
    message: '登录成功',
    user: { id: user.id, name: user.name },
  };

  if (user.name === 'admin' && user.defaultPasswordChanged === false) {
    responseBody.forcePasswordChange = true;
  }

  return jsonResponse(responseBody, 200, { 'Set-Cookie': cookie });
}
