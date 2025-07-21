import { User } from '@/types'

interface Env {
  KV: KVNamespace;
}

export async function authenticateUser(request: Request, env: Env): Promise<User | null> {
  const cookieHeader = request.headers.get('Cookie');
  const cookies = cookieHeader ? Object.fromEntries(cookieHeader.split('; ').map(c => c.split('='))) : {};
  const token = cookies['auth_token'];

  if (!token) {
    return null
  }

  const KV = env.KV;
  // In our simplified setup, the token is the user ID
  const userJson = await KV.get(`user:${token}`)

  if (!userJson) {
    return null
  }

  return JSON.parse(userJson) as User
}
