import { jsonResponse, errorResponse } from './utils/response';
import { parse } from 'cookie';
import { Env } from '@shared/types';
import { parseSubscriptionContent } from './utils/subscription-parser';
import { SubscriptionDataAccess } from './utils/data-access';

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

  try {
    const subscription = await SubscriptionDataAccess.getById(env, id);

    if (!subscription) {
      return errorResponse('订阅不存在', 404);
    }

    console.log(`[Preview] Fetching subscription: ${subscription.name} - ${subscription.url}`);
    const response = await fetch(subscription.url, {
        headers: { 'User-Agent': 'ProSub/1.0' }
    });

    if (!response.ok) {
      throw new Error(`请求订阅链接失败，状态码: ${response.status}`);
    }

    const content = await response.text();
    
    // 使用新的解析工具函数
    const nodes = await parseSubscriptionContent(content, subscription.url);
    
    // 返回预览信息
    const preview = {
      subscription: subscription,
      nodeCount: nodes.length,
      nodes: nodes.slice(0, 10), // 只返回前10个节点作为预览
      totalNodes: nodes.length,
      previewTime: new Date().toISOString()
    };

    return jsonResponse(preview);

  } catch (error) {
    console.error(`[Preview] Failed to preview subscription ${id}:`, error);
    return errorResponse(error instanceof Error ? error.message : '预览订阅失败');
  }
}