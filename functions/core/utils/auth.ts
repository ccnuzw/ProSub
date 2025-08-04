import { parse } from 'cookie';
import { UserDataAccess } from './d1-data-access';
import { User, Env } from '@shared/types';

export async function requireAuth(request: Request, env: Env): Promise<User | Response> {
  try {
    const cookies = parse(request.headers.get('Cookie') || '');
    const sessionToken = cookies.session;

    if (!sessionToken) {
      return new Response(JSON.stringify({ error: '未登录' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 从KV获取会话数据
    const sessionDataJson = await env.KV.get(`session:${sessionToken}`);
    if (!sessionDataJson) {
      return new Response(JSON.stringify({ error: '会话已过期' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const sessionData = JSON.parse(sessionDataJson);
    
    // 检查会话是否过期
    if (new Date(sessionData.expiresAt) < new Date()) {
      // 删除过期会话
      await env.KV.delete(`session:${sessionToken}`);
      return new Response(JSON.stringify({ error: '会话已过期' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 从数据库获取用户信息
    const user = await UserDataAccess.getById(env, sessionData.userId);
    if (!user) {
      return new Response(JSON.stringify({ error: '用户不存在' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return user;
  } catch (error) {
    console.error('认证失败:', error);
    return new Response(JSON.stringify({ error: '认证失败' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}