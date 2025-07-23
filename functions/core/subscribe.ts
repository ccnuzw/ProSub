import { jsonResponse, errorResponse } from './utils/response';
import { generateSubscriptionResponse } from '@shared/subscription-generator';
import { Env, Profile } from '@shared/types';

const CACHE_TTL_SECONDS = 600; // 缓存 10 分钟

async function getProfile(KV: KVNamespace, profileId: string): Promise<Profile | null> {
  const profileJson = await KV.get(`profile:${profileId}`);
  return profileJson ? JSON.parse(profileJson) : null;
}

async function recordTraffic(KV: KVNamespace, profileId: string, alias?: string) {
  try {
    const timestamp = new Date().toISOString();
    const key = `traffic:${profileId}:${timestamp}`;
    await KV.put(key, JSON.stringify({ timestamp, profileId, alias }));
  } catch (error) {
    console.error('Failed to record traffic:', error);
  }
}

export async function handleSubscribe(request: Request, env: Env, profile_id: string, alias?: string): Promise<Response> {
  try {
    const KV = env.KV;
    const cacheKey = `sub_cache:${profile_id}:${request.headers.get('User-Agent') || 'default'}`;

    // 1. 尝试从缓存中读取
    const cachedResponse = await KV.get(cacheKey, 'text');
    if (cachedResponse) {
      // 如果找到缓存，直接返回
      return new Response(cachedResponse, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    // 2. 如果没有缓存，执行生成逻辑
    const profile = await getProfile(KV, profile_id);
    if (!profile) return new Response('Profile not found', { status: 404 });

    await recordTraffic(KV, profile_id, alias);

    const response = await generateSubscriptionResponse(request, profile, env);
    const responseBody = await response.text();

    // 3. 将生成的内容写入缓存，并设置 TTL
    // 使用 ctx.waitUntil 确保即使在返回响应后，写入操作也能完成
    // 注意: Cloudflare Pages Functions 可能没有 ctx，可以直接 await
    await KV.put(cacheKey, responseBody, { expirationTtl: CACHE_TTL_SECONDS });

    return new Response(responseBody, { headers: response.headers });

  } catch (error) {
    console.error(`为配置文件 ${profile_id} 生成订阅失败:`, error);
    return new Response('Failed to generate subscription', { status: 500 });
  }
}