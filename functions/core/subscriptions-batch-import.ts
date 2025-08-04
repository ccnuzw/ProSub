import { jsonResponse, errorResponse } from './utils/response';
import { requireAuth } from './utils/auth';
import { SubscriptionDataAccess } from './utils/d1-data-access';
import { Env, Subscription } from '@shared/types';

export async function handleSubscriptionsBatchImport(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { subscriptions } = await request.json();
    
    if (!Array.isArray(subscriptions)) {
      return errorResponse('订阅数据格式错误', 400);
    }

    const results = [];
    const errors = [];

    for (const subscription of subscriptions) {
      try {
        const createdSubscription = await SubscriptionDataAccess.create(env, subscription);
        results.push(createdSubscription);
      } catch (error) {
        console.error(`创建订阅失败: ${subscription.name}`, error);
        errors.push({
          subscription: subscription.name,
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
    }

    return jsonResponse({
      success: true,
      created: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    console.error('批量导入订阅失败:', error);
    return errorResponse('批量导入订阅失败');
  }
}