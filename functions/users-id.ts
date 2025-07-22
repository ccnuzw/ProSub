import { User } from './types';
import { authenticateUser } from './lib/auth';

// Helper function to convert ArrayBuffer to hex string
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.prototype.map.call(new Uint8Array(buffer), (x: number) => ('00' + x.toString(16)).slice(-2)).join('');
}

// Re-implement password hashing using Web Crypto API (SHA-256)
async function hashPassword(password: string): Promise<string> {
  const saltBuffer = crypto.getRandomValues(new Uint8Array(16));
  const salt = arrayBufferToHex(saltBuffer.buffer);
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password + salt);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);
  const hashHex = arrayBufferToHex(hashBuffer);
  
  return `${salt}:${hashHex}`;
}

interface Env {
  KV: KVNamespace;
}

export async function handleUserGet(request: Request, env: Env, id: string): Promise<Response> {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ message: '未授权' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const KV = env.KV;
    const userJson = await KV.get(`user:${id}`);
    if (!userJson) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    const user = JSON.parse(userJson);
    delete user.password;
    return new Response(JSON.stringify(user), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error(`Failed to fetch user ${id}:`, error);
    return new Response(JSON.stringify({ error: 'Failed to fetch user' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function handleUserPut(request: Request, env: Env, id: string): Promise<Response> {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ message: '未授权' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { name, password, profiles } = (await request.json()) as { name?: string; password?: string; profiles?: string[] };
    const KV = env.KV;
    const userJson = await KV.get(`user:${id}`);
    if (!userJson) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
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
    return new Response(JSON.stringify(userWithoutPassword), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error(`Failed to update user ${id}:`, error);
    return new Response(JSON.stringify({ error: 'Failed to update user' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
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
      return new Response(JSON.stringify({ error: 'Failed to delete user' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
