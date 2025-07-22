import { jsonResponse } from '../utils/response';
import { serialize } from 'cookie';

export async function handleLogout(request: Request, env: Env): Promise<Response> {
  const cookie = serialize('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // 在Cloudflare环境中，建议直接设为true或根据域名判断
    sameSite: 'strict',
    maxAge: -1, // 立即过期
    path: '/',
  });

  return jsonResponse({ message: '登出成功' }, 200, { 'Set-Cookie': cookie });
}