import { jsonResponse, errorResponse } from '../utils/response';
import { serialize, parse } from 'cookie';
import { Env } from '@shared/types';

export async function handleLogout(request: Request, env: Env): Promise<Response> {
  try {
    const cookies = parse(request.headers.get('Cookie') || '');
    const token = cookies.auth_token;

    if (token) {
      await env.KV.delete(`user_session:${token}`);
    }

    const cookie = serialize('auth_token', '', {
      httpOnly: true,
      secure: env.ENVIRONMENT === 'production',
      maxAge: -1, // Expire the cookie immediately
      path: '/',
    });

    return jsonResponse({ message: '登出成功' }, 200, { 'Set-Cookie': cookie });
  } catch (error) {
    console.error('登出失败:', error);
    return errorResponse('登出失败');
  }
}