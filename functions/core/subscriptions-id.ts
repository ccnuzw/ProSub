import { jsonResponse, errorResponse } from './utils/response';
import { Subscription, Env } from '@shared/types';

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

export async function handleSubscriptionGet(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const allSubscriptions = await getAllSubscriptions(env);
    const sub = allSubscriptions[id];
    if (!sub) {
      return errorResponse('Subscription not found', 404);
    }
    return jsonResponse(sub);
  } catch (error) {
    console.error(`Failed to fetch subscription ${id}:`, error);
    return errorResponse('Failed to fetch subscription');
  }
}

export async function handleSubscriptionPut(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const { name, url } = (await request.json()) as SubscriptionRequest;
    const updatedSubscription: Subscription = { id, name, url };
    
    const allSubscriptions = await getAllSubscriptions(env);
    if (!allSubscriptions[id]) {
      return errorResponse('Subscription not found', 404);
    }
    allSubscriptions[id] = updatedSubscription;
    await putAllSubscriptions(env, allSubscriptions);
    
    return jsonResponse(updatedSubscription);
  } catch (error) {
    console.error(`Failed to update subscription ${id}:`, error);
    return errorResponse('Failed to update subscription');
  }
}

export async function handleSubscriptionDelete(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const allSubscriptions = await getAllSubscriptions(env);
    if (!allSubscriptions[id]) {
      return errorResponse('Subscription not found', 404);
    }
    delete allSubscriptions[id];
    await putAllSubscriptions(env, allSubscriptions);
    
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete subscription ${id}:`, error);
    return errorResponse('Failed to delete subscription');
  }
}
