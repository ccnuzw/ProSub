import { jsonResponse, errorResponse } from './utils/response';
import { requireAuth } from './utils/auth';
import { SubscriptionDataAccess } from './utils/d1-data-access';
import { Env } from '@shared/types';

export async function handleSubscriptionStatusesGet(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const subscriptions = await SubscriptionDataAccess.getAll(env);
    
    const statuses = subscriptions.map(subscription => ({
      id: subscription.id,
      name: subscription.name,
      nodeCount: subscription.nodeCount,
      lastUpdated: subscription.lastUpdated,
      error: subscription.error
    }));

    return jsonResponse(statuses);
  } catch (error) {
    console.error('获取订阅状态失败:', error);
    return errorResponse('获取订阅状态失败');
  }
}
