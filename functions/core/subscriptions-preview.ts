import { jsonResponse, errorResponse } from './utils/response';
import { requireAuth } from './utils/auth';
import { Env } from '@shared/types';
import { parseSubscriptionContent } from './utils/subscription-parser';
import { SubscriptionDataAccess } from './utils/d1-data-access';

export async function handleSubscriptionsPreview(request: Request, env: Env, id: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const subscription = await SubscriptionDataAccess.getById(env, id);

    if (!subscription) {
      console.log(`[Preview] Subscription ${id} not found in database.`);
      return errorResponse('订阅不存在', 404);
    }

    console.log(`[Preview] Fetched subscription: ${subscription.name} - ${subscription.url}`);

    console.log(`[Preview] Fetching content from URL: ${subscription.url}`);
    const response = await fetch(subscription.url, {
        headers: { 'User-Agent': 'ProSub/1.0' }
    });

    if (!response.ok) {
      console.error(`[Preview] Failed to fetch URL content: ${response.status}`);
      throw new Error(`请求订阅链接失败，状态码: ${response.status}`);
    }

    console.log('[Preview] Reading response content.');
    const content = await response.text();
    
    // 使用新的解析工具函数
    const nodes = await parseSubscriptionContent(content, subscription.url);
    
    return jsonResponse({
      subscription: subscription,
      nodes: nodes,
      nodeCount: nodes.length
    });

  } catch (error) {
    console.error(`[Preview] Failed to preview subscription ${id}:`, error);
    return errorResponse(error instanceof Error ? error.message : '预览订阅失败');
  }
}