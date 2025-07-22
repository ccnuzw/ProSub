import { jsonResponse, errorResponse } from './utils/response';
import { parse } from 'cookie';

// 定义订阅状态的类型
interface SubscriptionStatus {
  status: 'success' | 'error';
  nodeCount: number;
  lastUpdated: string;
  error?: string;
}



// 基础的 Base64 解码函数
function base64Decode(str: string): string {
    try {
        return atob(str.replace(/_/g, '/').replace(/-/g, '+'));
    } catch (e) {
        return ''; // 如果解码失败，返回空字符串
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

  const KV = env.KV;

  try {
    const subJson = await KV.get(`subscription:${id}`);
    if (!subJson) {
      return errorResponse('订阅不存在', 404);
    }
    const subscription: Subscription = JSON.parse(subJson);

    const response = await fetch(subscription.url, {
        headers: { 'User-Agent': 'ProSub/1.0' }
    });

    if (!response.ok) {
      throw new Error(`请求订阅链接失败，状态码: ${response.status}`);
    }

    const content = await response.text();
    const decodedContent = base64Decode(content);
    const nodeCount = decodedContent.split(/\r?\n|\r/).filter(Boolean).length;

    const status: SubscriptionStatus = {
      status: 'success',
      nodeCount: nodeCount,
      lastUpdated: new Date().toISOString(),
    };
    
    await KV.put(`sub-status:${id}`, JSON.stringify(status));

    return jsonResponse(status);

  } catch (error) {
    const status: SubscriptionStatus = {
        status: 'error',
        nodeCount: 0,
        lastUpdated: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
    };
    await KV.put(`sub-status:${id}`, JSON.stringify(status));
    
    console.error(`Failed to update subscription ${id}:`, error);
    return jsonResponse(status, 500);
  }
}