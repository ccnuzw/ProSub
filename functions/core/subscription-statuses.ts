import { jsonResponse, errorResponse } from './utils/response';
import { Subscription, Env } from '@shared/types';

const ALL_SUBSCRIPTIONS_KEY = 'ALL_SUBSCRIPTIONS';

async function getAllSubscriptions(env: Env): Promise<Record<string, Subscription>> {
  const subsJson = await env.KV.get(ALL_SUBSCRIPTIONS_KEY);
  return subsJson ? JSON.parse(subsJson) : {};
}

export async function handleSubscriptionStatuses(request: Request, env: Env): Promise<Response> {
  try {
    const allSubscriptions = await getAllSubscriptions(env);
    
    const statuses: Record<string, any> = {};
    for (const subId in allSubscriptions) {
      const sub = allSubscriptions[subId];
      statuses[subId] = {
        nodeCount: sub.nodeCount || 0,
        lastUpdated: sub.lastUpdated || null,
        status: sub.error ? 'error' : 'success',
        error: sub.error || undefined,
      };
    }
    return jsonResponse(statuses);
  } catch (error) {
    console.error('Failed to fetch subscription statuses:', error);
    return errorResponse('获取订阅状态失败');
  }
}
