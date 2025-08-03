import { jsonResponse, errorResponse } from './utils/response';
import { parse } from 'cookie';
import { Env } from '@shared/types';
import { parseSubscriptionContent } from './utils/subscription-parser';
import { SubscriptionDataAccess } from './utils/data-access';

export async function handleSubscriptionsUpdate(request: Request, env: Env, id: string): Promise<Response> {
  const cookies = parse(request.headers.get('Cookie') || '');
  const token = cookies.auth_token;

  if (!token) {
    return errorResponse('未授权', 401);
  }

  const userId = await env.KV.get(`user_session:${token}`);

  if (!userId) {
    return errorResponse('未授权', 401);
  }

  try {
    const subscription = await SubscriptionDataAccess.getById(env, id);

    if (!subscription) {
      console.log(`[Update] Subscription ${id} not found in KV.`);
      return errorResponse('订阅不存在', 404);
    }

    console.log(`[Update] Fetched subscription: ${subscription.name} - ${subscription.url}`);

    console.log(`[Update] Fetching content from URL: ${subscription.url}`);
    const response = await fetch(subscription.url, {
        headers: { 'User-Agent': 'ProSub/1.0' }
    });

    if (!response.ok) {
      console.error(`[Update] Failed to fetch URL content: ${response.status}`);
      throw new Error(`请求订阅链接失败，状态码: ${response.status}`);
    }

    console.log('[Update] Reading response content.');
    const content = await response.text();
    
    // 使用新的解析工具函数
    const nodes = await parseSubscriptionContent(content, subscription.url);
    
    // 更新订阅状态
    const updatedSubscription = await SubscriptionDataAccess.updateStatus(env, id, nodes.length);
    return jsonResponse(updatedSubscription);

  } catch (error) {
    console.error(`[Update] Failed to update subscription ${id}:`, error);
    
    try {
      await SubscriptionDataAccess.updateStatus(
        env, 
        id, 
        0, 
        error instanceof Error ? error.message : String(error)
      );
    } catch (updateError) {
      console.error('Failed to update subscription error status:', updateError);
    }
    
    return errorResponse(error instanceof Error ? error.message : '更新订阅失败');
  }
}