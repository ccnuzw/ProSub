import { jsonResponse } from '../utils/response';
import { parse, serialize } from 'cookie';
import { Env } from '@shared/types';

export async function handleLogout(request: Request, env: Env): Promise<Response> {
  try {
    const cookies = parse(request.headers.get('Cookie') || '');
    const token = cookies.auth_token;

    if (token) {
      // 删除会话
      await env.KV.delete(`user_session:${token}`);
    }

    // 清除Cookie
    const cookie = serialize('auth_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return jsonResponse({ message: '登出成功' }, {
      headers: {
        'Set-Cookie': cookie
      }
    });
  } catch (error) {
    console.error('登出失败:', error);
    return jsonResponse({ message: '登出成功' });
  }
}