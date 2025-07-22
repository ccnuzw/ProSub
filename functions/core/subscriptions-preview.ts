import { jsonResponse, errorResponse } from './utils/response';
import { parse } from 'cookie';

// 基础的 Base64 解码函数
function base64Decode(str: string): string {
    try {
        return atob(str.replace(/_/g, '/').replace(/-/g, '+'));
    } catch (e) {
        return ''; // 如果解码失败，返回空字符串
    }
}

export async function handleSubscriptionsPreview(request: Request, env: Env, id: string): Promise<Response> {
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
    const nodes = decodedContent.split(/[\r\n]+/).filter(Boolean);

    return jsonResponse({ nodes });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to preview subscription ${id}:`, error);
    return errorResponse(`预览订阅失败: ${errorMessage}`);
  }
}