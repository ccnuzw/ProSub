import { jsonResponse, errorResponse } from './utils/response';
import { parse } from 'cookie';
import { Subscription, Env } from '@shared/types';
import { parseNodeLink } from '@shared/node-parser';

const ALL_SUBSCRIPTIONS_KEY = 'ALL_SUBSCRIPTIONS';

async function getAllSubscriptions(env: Env): Promise<Record<string, Subscription>> {
  const subsJson = await env.KV.get(ALL_SUBSCRIPTIONS_KEY);
  return subsJson ? JSON.parse(subsJson) : {};
}

async function putAllSubscriptions(env: Env, subscriptions: Record<string, Subscription>): Promise<void> {
  await env.KV.put(ALL_SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
}

export async function handleSubscriptionsBatchImport(request: Request, env: Env): Promise<Response> {
  const cookies = parse(request.headers.get('Cookie') || '');
  const token = cookies.auth_token;

  if (!token) {
    return errorResponse('未授权', 401);
  }

  const userJson = await env.KV.get(`user:${token}`);

  if (!userJson) {
    return errorResponse('未授权', 401);
  }

  try {
    const { urls } = (await request.json()) as { urls: string[] };

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return errorResponse('请求体中需要提供 urls 数组', 400);
    }

    const allSubscriptions = await getAllSubscriptions(env);
    const existingSubscriptionUrls = new Set<string>(Object.values(allSubscriptions).map(sub => sub.url));

    const importedSubscriptions: Subscription[] = [];

    for (const url of urls) {
      if (existingSubscriptionUrls.has(url)) {
        console.warn(`Skipping duplicate subscription URL: ${url}`);
        continue;
      }

      let name = url;
      try {
        const urlObj = new URL(url);
        name = urlObj.hostname;
      } catch (e) {
        // If URL is invalid, use the full URL as name
        console.warn(`Invalid URL format, using full URL as name: ${url}`);
      }

      const id = crypto.randomUUID();
      const newSubscription: Subscription = { id, name, url };
      allSubscriptions[id] = newSubscription;
      importedSubscriptions.push(newSubscription);
    }

    if (importedSubscriptions.length > 0) {
      await putAllSubscriptions(env, allSubscriptions);
    }

    return jsonResponse({
      message: `成功导入 ${importedSubscriptions.length} 条订阅。`,
      importedCount: importedSubscriptions.length,
      importedSubscriptions,
    });

  } catch (error) {
    console.error('处理批量导入订阅失败:', error);
    return errorResponse('处理批量导入订阅失败');
  }
}
