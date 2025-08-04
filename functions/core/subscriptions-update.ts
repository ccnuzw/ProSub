import { jsonResponse, errorResponse } from './utils/response';
import { requireAuth } from './utils/auth';
import { Env } from '@shared/types';
import { parseSubscriptionContent } from './utils/subscription-parser';
import { SubscriptionDataAccess } from './utils/d1-data-access';

export async function handleSubscriptionsUpdate(request: Request, env: Env, id: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const subscription = await SubscriptionDataAccess.getById(env, id);

    if (!subscription) {
      console.log(`[Update] Subscription ${id} not found in database.`);
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