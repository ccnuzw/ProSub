import { jsonResponse, errorResponse } from './utils/response';
import { parse } from 'cookie';
import { hashPassword, comparePassword } from './utils/crypto';
import { User, Env, UserSession } from '@shared/types';

async function authenticateUser(request: Request, env: Env): Promise<UserSession | null> {
  const cookies = parse(request.headers.get('Cookie') || '');
  const token = cookies.auth_token;

  if (!token) {
    return null;
  }

  const userSessionJson = await env.KV.get(`user_session:${token}`);
  if (!userSessionJson) {
    return null;
  }

  const userSession = JSON.parse(userSessionJson) as UserSession;
  if (userSession.expires < Date.now()) {
    await env.KV.delete(`user_session:${token}`);
    return null;
  }

  return userSession;
}

export async function handleUsersGet(request: Request, env: Env): Promise<Response> {
  const cookies = parse(request.headers.get('Cookie') || '');
  const token = cookies.auth_token;

  if (!token) {
    return errorResponse('未授权', 401);
  }

  const userJson = await env.KV.get(`user:${token}`);

  if (!userJson) {
    return errorResponse('未授权', 401);
  }

  try {
    const KV = env.KV;
    const userIndexJson = await KV.get('_index:users');
    const userIds = userIndexJson ? JSON.parse(userIndexJson) : [];

    const users = await Promise.all(
      userIds.map(async (userId: string) => {
        const userJson = await KV.get(`user:${userId}`);
        const user = userJson ? JSON.parse(userJson) : null;
        if (user) {
          delete user.password;
        }
        return user;
      })
    );
    
    return jsonResponse(users.filter(Boolean));
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return errorResponse('Failed to fetch users');
  }
}

export async function handleUsersPost(request: Request, env: Env): Promise<Response> {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return errorResponse('未授权', 401);
  }

  try {
    const { name, password, profiles } = (await request.json()) as { name: string; password: string; profiles?: string[] };

    if (!name || !password) {
      return errorResponse('用户名和密码是必填项', 400);
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
      return errorResponse('用户已存在', 409);
    }

    const hashedPassword = await hashPassword(password);
    const id = crypto.randomUUID();
    const newUser: User = { id, name, password: hashedPassword, profiles: profiles || [], defaultPasswordChanged: true };
    
    await KV.put(`user:${id}`, JSON.stringify(newUser));

    const userIndexJson = await KV.get('_index:users');
    const userIds = userIndexJson ? JSON.parse(userIndexJson) : [];
    userIds.push(id);
    await KV.put('_index:users', JSON.stringify(userIds));
    
    const { password: _, ...userWithoutPassword } = newUser;
    return jsonResponse(userWithoutPassword);
  } catch (error) {
    console.error('Failed to create user:', error);
    return errorResponse('Failed to create user');
  }
}

export async function handleUserChangePassword(request: Request, env: Env): Promise<Response> {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return errorResponse('未授权', 401);
  }

  try {
    const { oldPassword, newPassword } = (await request.json()) as { oldPassword: string; newPassword: string };

    if (!oldPassword || !newPassword) {
      return errorResponse('旧密码和新密码是必填项', 400);
    }

    const KV = env.KV;
    const userJson = await KV.get(`user:${authenticatedUser.id}`);
    if (!userJson) {
      return errorResponse('用户未找到', 404);
    }
    const user = JSON.parse(userJson) as User;

    const passwordMatch = await comparePassword(oldPassword, user.password);
    if (!passwordMatch) {
      return errorResponse('旧密码不正确', 401);
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    user.defaultPasswordChanged = true; // Mark as changed
    await KV.put(`user:${user.id}`, JSON.stringify(user));

    return jsonResponse({ message: '密码修改成功' });
  } catch (error) {
    console.error('Failed to change password:', error);
    return errorResponse('Failed to change password');
  }
}
