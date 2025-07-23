import { jsonResponse, errorResponse } from './utils/response';
import { parse } from 'cookie';
import { Subscription, Env } from '@shared/types';
import { parseNodeLink } from '@shared/node-parser';
import { parseClashYaml } from '@shared/clash-parser';

const ALL_SUBSCRIPTIONS_KEY = 'ALL_SUBSCRIPTIONS';

async function getAllSubscriptions(env: Env): Promise<Record<string, Subscription>> {
  const subsJson = await env.KV.get(ALL_SUBSCRIPTIONS_KEY);
  return subsJson ? JSON.parse(subsJson) : {};
}

async function putAllSubscriptions(env: Env, subscriptions: Record<string, Subscription>): Promise<void> {
  await env.KV.put(ALL_SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
}

// 基础的 Base64 解码函数
function base64Decode(str: string): string | null {
    let normalizedStr = str.replace(/_/g, '/').replace(/-/g, '+');
    normalizedStr = normalizedStr.trim(); // Trim whitespace

    // Basic validation for Base64 string
    if (!normalizedStr || !/^[A-Za-z0-9+/=]*$/.test(normalizedStr) || normalizedStr.length % 4 !== 0) {
        return null; // Not a valid Base64 string or empty after trim
    }

    try {
        const binaryString = atob(normalizedStr);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
        return null; // Return null on atob error
    }
}

export async function handleSubscriptionsPreview(request: Request, env: Env, id: string): Promise<Response> {
  const cookies = parse(request.headers.get('Cookie') || '');
  const token = cookies.auth_token;

  if (!token) {
    return errorResponse('未授权', 401);
  }

  const userId = await env.KV.get(`user_session:${token}`);

  if (!userId) {
    return errorResponse('未授权', 401);
  }

  const KV = env.KV;

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
    let nodes: Node[] = [];

    // Heuristic: Check if the URL suggests Clash YAML (existing)
    const isClashYamlUrl = subscription.url.endsWith('.yaml') || subscription.url.endsWith('.yml') || subscription.url.includes('/clash/');

    // New: Check if content looks like YAML
    const isContentYaml = content.startsWith('---') || content.includes('proxies:') || content.includes('proxy-groups:') || content.includes('rules:');

    if (isClashYamlUrl || isContentYaml) {
      nodes = parseClashYaml(content);
      // If Clash YAML parsing yields no nodes, fall back to parsing as node links
      if (nodes.length === 0) {
        const attemptedDecode = base64Decode(content);
        if (attemptedDecode) {
          decodedContent = attemptedDecode;
        } else {
          decodedContent = content;
        }
        const lines = decodedContent.split(/\r?\n|\r/).filter(line => line.trim() !== '');
        nodes = lines.map(line => parseNodeLink(line)).filter(Boolean);
      }
    } else {
      // Existing logic for non-Clash YAML content
      const attemptedDecode = base64Decode(content);
      if (attemptedDecode) {
        decodedContent = attemptedDecode;
      } else {
        decodedContent = content;
      }
      const lines = decodedContent.split(/\r?\n|\r/).filter(line => line.trim() !== '');
      nodes = lines.map(line => parseNodeLink(line)).filter(Boolean);
    }

    return jsonResponse({ nodes });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return errorResponse(`预览订阅失败: ${errorMessage}`);
  }
}