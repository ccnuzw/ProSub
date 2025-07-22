import { User } from '../types'

interface Env {
  KV: KVNamespace;
}

export async function authenticateUser(request: Request, env: Env): Promise<User | null> {
  let kv: KVNamespace;

  // Check if env.KV is a valid KVNamespace instance with a 'get' method
  if (env && env.KV && typeof env.KV.get === 'function') {
    kv = env.KV;
  } else {
    // Fallback to a simple in-memory mock for local development
    console.warn('Warning: env.KV is not a fully functional KVNamespace. Using in-memory mock for local development.');
    const inMemoryStore: Record<string, string> = {};
    kv = {
      get: async (key: string) => {
        console.log(`Mock KV.get called for key: ${key}`);
        return inMemoryStore[key] || null;
      },
      put: async (key: string, value: string) => {
        console.log(`Mock KV.put called for key: ${key}`);
        inMemoryStore[key] = value;
      },
      delete: async (key: string) => {
        console.log(`Mock KV.delete called for key: ${key}`);
        delete inMemoryStore[key];
      },
      list: async () => {
        console.log('Mock KV.list called');
        return { keys: Object.keys(inMemoryStore).map(key => ({ name: key })), list_complete: true };
      }
    } as KVNamespace;
  }

  const cookieHeader = request.headers.get('Cookie');
  const cookies = cookieHeader ? Object.fromEntries(cookieHeader.split('; ').map(c => c.split('='))) : {};
  const token = cookies['auth_token'];

  if (!token) {
    return null
  }

  const userJson = await kv.get(`user:${token}`)

  if (!userJson) {
    return null
  }

  return JSON.parse(userJson) as User
}
