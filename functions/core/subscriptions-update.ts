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

// 基础的 Base64 解码函数
function base64Decode(str: string): string {
    try {
        const normalizedStr = str.replace(/_/g, '/').replace(/-/g, '+');
        const binaryString = atob(decodeURIComponent(normalizedStr));
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
        console.error('Failed to decode base64 string:', str, e);
        return '';
    }
}

export async function handleSubscriptionsUpdate(request: Request, env: Env, id: string): Promise<Response> {
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
    const allSubscriptions = await getAllSubscriptions(env);
    const subscription = allSubscriptions[id];

    if (!subscription) {
      return errorResponse('订阅不存在', 404);
    }

    const response = await fetch(subscription.url, {
        headers: { 'User-Agent': 'ProSub/1.0' }
    });

    if (!response.ok) {
      throw new Error(`请求订阅链接失败，状态码: ${response.status}`);
    }

    const content = await response.text();
    let decodedContent = '';

    // Check if content looks like HTML
    const isHtmlContent = content.trim().startsWith('<') && (content.includes('<html') || content.includes('<body'));

    if (isHtmlContent) {
        throw new Error('Subscription URL returned HTML content instead of subscription data.');
    }

    try {
      // Attempt to decode as Base64
      decodedContent = base64Decode(content);
    } catch (decodeError) {
      // If decoding fails, assume content is already plain text
      console.warn(`Content from ${subscription.url} is not valid Base64, treating as plain text.`);
      decodedContent = content;
    }

    const lines = decodedContent.split(/\r?\n|\r/).filter(line => line.trim() !== '');
    const nodeCount = lines.filter(line => parseNodeLink(line)).length;

    // If content was not Base64 decoded and yielded no nodes, it might be invalid
    if (nodeCount === 0 && content.trim().length > 0 && !decodedContent.includes('vmess://') && !decodedContent.includes('ss://') && !decodedContent.includes('ssr://') && !decodedContent.includes('trojan://') && !decodedContent.includes('vless://')) {
        throw new Error('Subscription content is not valid Base64 and contains no recognizable node links.');
    }

    subscription.nodeCount = nodeCount;
    subscription.lastUpdated = new Date().toISOString();
    subscription.error = undefined; // Clear any previous error

    await putAllSubscriptions(env, allSubscriptions);

    return jsonResponse(subscription);

  } catch (error) {
    const allSubscriptions = await getAllSubscriptions(env);
    const subscription = allSubscriptions[id];

    if (subscription) {
      subscription.nodeCount = 0;
      subscription.lastUpdated = new Date().toISOString();
      subscription.error = error instanceof Error ? error.message : String(error);
      await putAllSubscriptions(env, allSubscriptions);
    }
    
    console.error(`Failed to update subscription ${id}:`, error);
    return jsonResponse(subscription || { id, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}