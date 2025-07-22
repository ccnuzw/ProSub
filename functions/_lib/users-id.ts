import { jsonResponse, errorResponse } from './utils/response';
import { authenticateUser } from './lib/auth';

import { hashPassword } from './utils/crypto';

interface Env {
  KV: KVNamespace;
}

export async function handleUserGet(request: Request, env: Env, id: string): Promise<Response> {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return errorResponse('未授权', 401);
  }

  try {
    const KV = env.KV;
    const userJson = await KV.get(`user:${id}`);
    if (!userJson) {
      return errorResponse('User not found', 404);
    }
    const user = JSON.parse(userJson);
    delete user.password;
    return jsonResponse(user);
  } catch (error) {
    console.error(`Failed to fetch user ${id}:`, error);
    return errorResponse('Failed to fetch user');
  }
}

export async function handleUserPut(request: Request, env: Env, id: string): Promise<Response> {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return errorResponse('未授权', 401);
  }

  try {
    const { name, password, profiles } = (await request.json()) as { name?: string; password?: string; profiles?: string[] };
    const KV = env.KV;
    const userJson = await KV.get(`user:${id}`);
    if (!userJson) {
      return errorResponse('User not found', 404);
    }
    const existingUser: User = JSON.parse(userJson);

    let hashedPassword = existingUser.password;
    let defaultPasswordChanged = existingUser.defaultPasswordChanged;

    if (password) {
      hashedPassword = await hashPassword(password);
      if (existingUser.name === 'admin' && existingUser.defaultPasswordChanged === false) {
        defaultPasswordChanged = true;
      }
    }

    const updatedUser: User = { 
      ...existingUser,
      id: id, 
      name: name || existingUser.name, 
      password: hashedPassword, 
      profiles: profiles || existingUser.profiles, 
      defaultPasswordChanged: defaultPasswordChanged
    };
    
    await KV.put(`user:${id}`, JSON.stringify(updatedUser));
    
    const { password: _, ...userWithoutPassword } = updatedUser;
    return jsonResponse(userWithoutPassword);
  } catch (error) {
    console.error(`Failed to update user ${id}:`, error);
    return errorResponse('Failed to update user');
  }
}

export async function handleUserDelete(request: Request, env: Env, id: string): Promise<Response> {
    const authenticatedUser = await authenticateUser(request, env);
    if (!authenticatedUser) {
      return new Response(JSON.stringify({ message: '未授权' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
  
    try {
      const KV = env.KV;
      await KV.delete(`user:${id}`);
      
      return new Response(null, { status: 204 });
    } catch (error) {
      console.error(`Failed to delete user ${id}:`, error);
      return errorResponse('Failed to delete user');
    }
}
