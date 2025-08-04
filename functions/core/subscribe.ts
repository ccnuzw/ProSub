import { jsonResponse, errorResponse } from './utils/response';
import { generateSubscriptionResponse } from '@shared/subscription-generator';
import { ProfileDataAccess } from './utils/d1-data-access';
import { Env, Profile } from '@shared/types';

const CACHE_TTL_SECONDS = 600; // 缓存 10 分钟

async function getProfile(env: Env, profileId: string): Promise<Profile | null> {
  return await ProfileDataAccess.getById(env, profileId);
}

async function recordTraffic(env: Env, profileId: string, alias?: string) {
  try {
    // TODO: 实现TrafficDataAccess
    // 暂时跳过流量记录
    console.log(`记录流量: profileId=${profileId}, alias=${alias}`);
  } catch (error) {
    console.error('Failed to record traffic:', error);
  }
}

export async function handleSubscribe(request: Request, env: Env, profile_id: string, alias?: string): Promise<Response> {
  try {
    const cacheKey = `sub_cache:${profile_id}:${request.headers.get('User-Agent') || 'default'}`;

    // 1. 尝试从缓存中读取
    const cachedResponse = await env.KV.get(cacheKey, 'text');
    if (cachedResponse) {
      // 如果找到缓存，直接返回
      return new Response(cachedResponse, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    // 2. 如果没有缓存，执行生成逻辑
    const profile = await getProfile(env, profile_id);
    if (!profile) return new Response('Profile not found', { status: 404 });

    await recordTraffic(env, profile_id, alias);

    const response = await generateSubscriptionResponse(request, profile, env);
    const responseBody = await response.text();

    // 3. 将生成的内容写入缓存，并设置 TTL
    await env.KV.put(cacheKey, responseBody, { expirationTtl: CACHE_TTL_SECONDS });

    return new Response(responseBody, { headers: response.headers });

  } catch (error) {
    console.error(`为配置文件 ${profile_id} 生成订阅失败:`, error);
    return new Response('Failed to generate subscription', { status: 500 });
  }
}