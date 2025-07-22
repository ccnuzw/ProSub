import { jsonResponse } from '../utils/response';



export async function handleLogout(request: Request, env: Env): Promise<Response> {
  const cookie = serialize('auth_token', '', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // Expire the cookie immediately
    path: '/',
  })

  return jsonResponse({ message: '登出成功' }, 200, { 'Set-Cookie': cookie });
}
