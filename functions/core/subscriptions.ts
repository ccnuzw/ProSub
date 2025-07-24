import { jsonResponse, errorResponse } from './utils/response';
import { Subscription, Env } from '@shared/types';
import { requireAuth } from './utils/auth';

const ALL_SUBSCRIPTIONS_KEY = 'ALL_SUBSCRIPTIONS';

async function getAllSubscriptions(env: Env): Promise<Record<string, Subscription>> {
  const subsJson = await env.KV.get(ALL_SUBSCRIPTIONS_KEY);
  return subsJson ? JSON.parse(subsJson) : {};
}

async function putAllSubscriptions(env: Env, subscriptions: Record<string, Subscription>): Promise<void> {
  await env.KV.put(ALL_SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
}

interface SubscriptionRequest {
  name: string;
  url: string;
}

export async function handleSubscriptionsGet(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const allSubscriptions = await getAllSubscriptions(env);
    return jsonResponse(Object.values(allSubscriptions));
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error);
    return errorResponse('Failed to fetch subscriptions');
  }
}

export async function handleSubscriptionsPost(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { name, url } = (await request.json()) as SubscriptionRequest;
    const id = crypto.randomUUID();
    const newSubscription: Subscription = { id, name, url };
    
    const allSubscriptions = await getAllSubscriptions(env);
    allSubscriptions[id] = newSubscription;
    await putAllSubscriptions(env, allSubscriptions);
    
    return jsonResponse(newSubscription);
  } catch (error) {
    console.error('Failed to create subscription:', error);
    return errorResponse('Failed to create subscription');
  }
}