import { User } from '@/types';
import { authenticateUser } from '@/lib/auth';

// --- Helper Functions (Web Crypto API) ---
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.prototype.map.call(new Uint8Array(buffer), (x: number) => ('00' + x.toString(16)).slice(-2)).join('');
}

async function hashPassword(password: string): Promise<string> {
  const saltBuffer = crypto.getRandomValues(new Uint8Array(16));
  const salt = arrayBufferToHex(saltBuffer.buffer);
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);
  const hashHex = arrayBufferToHex(hashBuffer);
  return `${salt}:${hashHex}`;
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    const [salt, key] = hash.split(':');
    if (!salt || !key) return false;
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password + salt);
    const derivedKeyBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);
    const derivedKeyHex = arrayBufferToHex(derivedKeyBuffer);
    return derivedKeyHex === key;
  } catch (e) {
    console.error("Password comparison failed", e);
    return false;
  }
}

interface Env {
  KV: KVNamespace;
}

export async function handleUsersGet(request: Request, env: Env): Promise<Response> {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ message: '未授权' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const KV = env.KV;
    const userList = await KV.list({ prefix: 'user:' });
    const users = await Promise.all(
      userList.keys.map(async ({ name: keyName }) => {
        const userJson = await KV.get(keyName);
        const user = userJson ? JSON.parse(userJson) : null;
        if (user) {
          delete user.password;
        }
        return user;
      })
    );
    return new Response(JSON.stringify(users.filter(Boolean)), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch users' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function handleUsersPost(request: Request, env: Env): Promise<Response> {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ message: '未授权' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { name, password, profiles } = (await request.json()) as { name: string; password: string; profiles?: string[] };

    if (!name || !password) {
      return new Response(JSON.stringify({ message: '用户名和密码是必填项' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const KV = env.KV;
    const existingUserList = await KV.list({ prefix: 'user:' });
    const existingUsers = await Promise.all(
      existingUserList.keys.map(async ({ name: keyName }) => {
        const userJson = await KV.get(keyName);
        return userJson ? JSON.parse(userJson) : null;
      })
    );
    if (existingUsers.filter(Boolean).some(u => u.name === name)) {
      return new Response(JSON.stringify({ message: '用户已存在' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }

    const hashedPassword = await hashPassword(password);
    const id = crypto.randomUUID();
    const newUser: User = { id, name, password: hashedPassword, profiles: profiles || [], defaultPasswordChanged: true };
    
    await KV.put(`user:${id}`, JSON.stringify(newUser));
    
    const { password: _, ...userWithoutPassword } = newUser;
    return new Response(JSON.stringify(userWithoutPassword), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Failed to create user:', error);
    return new Response(JSON.stringify({ error: 'Failed to create user' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function handleUserChangePassword(request: Request, env: Env): Promise<Response> {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ message: '未授权' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { oldPassword, newPassword } = (await request.json()) as { oldPassword: string; newPassword: string };

    if (!oldPassword || !newPassword) {
      return new Response(JSON.stringify({ message: '旧密码和新密码是必填项' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const KV = env.KV;
    const userJson = await KV.get(`user:${authenticatedUser.id}`);
    if (!userJson) {
      return new Response(JSON.stringify({ message: '用户未找到' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    const user = JSON.parse(userJson) as User;

    const passwordMatch = await comparePassword(oldPassword, user.password);
    if (!passwordMatch) {
      return new Response(JSON.stringify({ message: '旧密码不正确' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    user.defaultPasswordChanged = true; // Mark as changed
    await KV.put(`user:${user.id}`, JSON.stringify(user));

    return new Response(JSON.stringify({ message: '密码修改成功' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Failed to change password:', error);
    return new Response(JSON.stringify({ error: 'Failed to change password' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
