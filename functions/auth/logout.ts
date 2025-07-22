import { serialize } from 'cookie'

interface Env {
  NODE_ENV: string;
}

export async function handleLogout(request: Request, env: Env): Promise<Response> {
  const cookie = serialize('auth_token', '', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // Expire the cookie immediately
    path: '/',
  })

  return new Response(JSON.stringify({ message: '登出成功' }), {
    status: 200,
    headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' },
  })
}
