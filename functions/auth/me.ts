import { authenticateUser } from '../lib/auth'
import { User } from '../types'

interface Env {
  KV: KVNamespace;
}

export async function handleMe(request: Request, env: Env): Promise<Response> {
  const user = await authenticateUser(request, env)

  if (!user) {
    return new Response(JSON.stringify({ message: '未授权' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  }

  // Do not return password in the response
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = user
  return new Response(JSON.stringify(userWithoutPassword), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
