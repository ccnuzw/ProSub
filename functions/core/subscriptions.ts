import { jsonResponse, errorResponse } from './utils/response';
import { Env, Subscription } from '@shared/types';
import { requireAuth } from './utils/auth';
import { SubscriptionDataAccess } from './utils/data-access';

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
    const allSubscriptions = await SubscriptionDataAccess.getAll(env);
    return jsonResponse(Object.values(allSubscriptions));
  } catch (error) {
    console.error('获取订阅列表失败:', error);
    return errorResponse('获取订阅列表失败');
  }
}

export async function handleSubscriptionsPost(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { name, url } = (await request.json()) as SubscriptionRequest;
    
    if (!name || !url) {
      return errorResponse('订阅名称和URL不能为空', 400);
    }

    const id = crypto.randomUUID();
    const newSubscription: Subscription = {
      id,
      name,
      url,
      nodeCount: 0,
      lastUpdated: null,
      error: null
    };

    await SubscriptionDataAccess.create(env, newSubscription);
    return jsonResponse(newSubscription);
  } catch (error) {
    console.error('创建订阅失败:', error);
    return errorResponse('创建订阅失败');
  }
}

export async function handleSubscriptionGet(request: Request, env: Env, id: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }
  
  try {
    const subscription = await SubscriptionDataAccess.getById(env, id);
    if (!subscription) {
      return errorResponse('订阅不存在', 404);
    }
    return jsonResponse(subscription);
  } catch (error) {
    console.error(`获取订阅 ${id} 失败:`, error);
    return errorResponse('获取订阅失败');
  }
}

export async function handleSubscriptionUpdate(request: Request, env: Env, id: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { name, url } = (await request.json()) as SubscriptionRequest;
    
    if (!name || !url) {
      return errorResponse('订阅名称和URL不能为空', 400);
    }

    const updatedSubscription: Subscription = { id, name, url, nodeCount: 0, lastUpdated: null, error: null };
    const subscription = await SubscriptionDataAccess.update(env, id, updatedSubscription);
    return jsonResponse(subscription);
  } catch (error) {
    console.error('更新订阅失败:', error);
    return errorResponse('更新订阅失败');
  }
}

export async function handleSubscriptionDelete(request: Request, env: Env, id: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    await SubscriptionDataAccess.delete(env, id);
    return jsonResponse({ message: '订阅删除成功' });
  } catch (error) {
    console.error('删除订阅失败:', error);
    return errorResponse('删除订阅失败');
  }
}