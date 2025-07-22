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

export async function handleSubscriptionsPreview(request: Request, env: Env, id: string): Promise<Response> {
  console.log(`[Preview] Starting handleSubscriptionsPreview for ID: ${id}`);
  const cookies = parse(request.headers.get('Cookie') || '');
  const token = cookies.auth_token;

  if (!token) {
    console.log('[Preview] Unauthorized: No token');
    return errorResponse('未授权', 401);
  }

  const userJson = await env.KV.get(`user:${token}`);

  if (!userJson) {
    console.log('[Preview] Unauthorized: User not found for token');
    return errorResponse('未授权', 401);
  }

  const KV = env.KV;

  try {
    const allSubscriptions = await getAllSubscriptions(env);
    const subscription = allSubscriptions[id];

    if (!subscription) {
      console.log(`[Preview] Subscription ${id} not found in KV.`);
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
    let decodedContent = '';
    console.log('[Preview] Attempting to decode content.');
    try {
      // Attempt to decode as Base64
      decodedContent = base64Decode(content);
      console.log('[Preview] Content successfully Base64 decoded.');
    } catch (decodeError) {
      // If decoding fails, assume content is already plain text
      console.warn(`[Preview] Content from ${subscription.url} is not valid Base64, treating as plain text.`);
      decodedContent = content;
    }

    console.log('[Preview] Splitting content into lines and parsing nodes.');
    const lines = decodedContent.split(/\r?\n|\r/).filter(line => line.trim() !== '');
    const nodes = lines.map(line => parseNodeLink(line)).filter(Boolean);
    console.log(`[Preview] Found ${nodes.length} nodes.`);

    return jsonResponse({ nodes });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Preview] Failed to preview subscription ${id}:`, error);
    return errorResponse(`预览订阅失败: ${errorMessage}`);
  }
}