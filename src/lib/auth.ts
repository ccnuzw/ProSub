
import { NextRequest } from 'next/server'
import { User } from '@/types'

const getKVNamespace = () => {
  return process.env.PROSUB_KV as KVNamespace
}

export async function authenticateUser(request: NextRequest): Promise<User | null> {
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    return null
  }

  const kv = getKVNamespace()
  // In our simplified setup, the token is the user ID
  const userJson = await kv.get(`user:${token}`)

  if (!userJson) {
    return null
  }

  return JSON.parse(userJson) as User
}
