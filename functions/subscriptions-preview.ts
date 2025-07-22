import { authenticateUser } from './lib/auth';
import { Subscription } from './types';

interface Env {
  KV: KVNamespace;
}

// 基础的 Base64 解码函数
function base64Decode(str: string): string {
    try {
        return atob(str.replace(/_/g, '/').replace(/-/g, '+'));
    } catch (e) {
        return ''; // 如果解码失败，返回空字符串
    }
}

export async function handleSubscriptionsPreview(request: Request, env: Env, id: string): Promise<Response> {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ message: '未授权' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const KV = env.KV;

  try {
    const subJson = await KV.get(`subscription:${id}`);
    if (!subJson) {
      return new Response(JSON.stringify({ error: '订阅不存在' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
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

    return new Response(JSON.stringify({ nodes }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to preview subscription ${id}:`, error);
    return new Response(JSON.stringify({ error: `预览订阅失败: ${errorMessage}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}