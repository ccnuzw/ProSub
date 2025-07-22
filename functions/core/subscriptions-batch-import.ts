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
    let importedCount = 0;
    let skippedCount = 0;

    for (const rawUrl of urls) {
      let processedUrl = rawUrl.trim();

      // Skip empty lines (frontend already filters, but for robustness)
      if (!processedUrl) {
        skippedCount++;
        continue;
      }

      // Attempt to prepend https:// if no protocol is present
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = `https://${processedUrl}`;
      }

      let urlObj: URL;
      try {
        urlObj = new URL(processedUrl);
      } catch (e) {
        console.warn(`Skipping invalid URL format: ${rawUrl}. Error: ${e instanceof Error ? e.message : String(e)}`);
        skippedCount++;
        continue; // Skip this URL if it's truly invalid
      }

      // Check for duplicate URLs
      if (existingSubscriptionUrls.has(urlObj.toString())) {
        console.warn(`Skipping duplicate subscription URL: ${urlObj.toString()}`);
        skippedCount++;
        continue;
      }

      let name = urlObj.hostname;

      const id = crypto.randomUUID();
      const newSubscription: Subscription = { id, name, url: urlObj.toString() };
      allSubscriptions[id] = newSubscription;
      importedSubscriptions.push(newSubscription);
      importedCount++;
    }

    if (importedSubscriptions.length > 0) {
      await putAllSubscriptions(env, allSubscriptions);
    }

    return jsonResponse({
      message: `成功导入 ${importedCount} 个订阅，跳过 ${skippedCount} 个无效或重复订阅。`,
      importedCount,
      skippedCount,
      importedSubscriptions,
    });

  } catch (error) {
    console.error('处理批量导入订阅失败:', error);
    return errorResponse('处理批量导入订阅失败');
  }
}