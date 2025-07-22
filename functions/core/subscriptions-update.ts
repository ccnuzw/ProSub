import { jsonResponse, errorResponse } from './utils/response';
import { parse } from 'cookie';
import { Subscription, Env, Node } from '@shared/types';
import { parseNodeLink } from '@shared/node-parser';
import * as yaml from 'js-yaml';

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

// 将 Clash 代理配置转换为 Node 接口
function clashProxyToNode(proxy: any): Node | null {
  if (!proxy || !proxy.name || !proxy.type || !proxy.server || !proxy.port) {
    return null;
  }

  const node: Partial<Node> = {
    id: crypto.randomUUID(),
    name: proxy.name,
    server: proxy.server,
    port: proxy.port,
    type: proxy.type as Node['type'],
    params: { ...proxy }, // Store all original proxy parameters
  };

  // Map common fields
  switch (proxy.type) {
    case 'ss':
      node.password = proxy.password;
      node.params = { method: proxy.cipher, ...proxy.udpRelay !== undefined && { udpRelay: proxy.udpRelay } };
      break;
    case 'ssr':
      node.password = proxy.password;
      node.params = { 
        protocol: proxy.protocol,
        protocolparam: proxy['protocol-param'],
        obfs: proxy.obfs,
        obfsparam: proxy['obfs-param'],
      };
      break;
    case 'vmess':
      node.password = proxy.uuid; // VMess uses uuid as password
      node.params = {
        uuid: proxy.uuid,
        alterId: proxy.alterId,
        cipher: proxy.cipher,
        network: proxy.network,
        tls: proxy.tls,
        wsPath: proxy['ws-path'],
        wsHeaders: proxy['ws-headers'],
        udpRelay: proxy.udpRelay,
      };
      break;
    case 'trojan':
      node.password = proxy.password;
      node.params = {
        sni: proxy.sni,
        skipCertVerify: proxy['skip-cert-verify'],
        udpRelay: proxy.udpRelay,
      };
      break;
    case 'vless':
      node.password = proxy.uuid;
      node.params = {
        uuid: proxy.uuid,
        network: proxy.network,
        tls: proxy.tls,
        wsPath: proxy['ws-path'],
        wsHeaders: proxy['ws-headers'],
        flow: proxy.flow,
        udpRelay: proxy.udpRelay,
      };
      if (proxy.tls && proxy.realityOpts) {
        node.type = 'vless-reality';
        node.params = { ...node.params, ...proxy.realityOpts };
      }
      break;
    case 'socks5':
      node.password = proxy.password;
      node.params = { username: proxy.username, udpRelay: proxy.udpRelay };
      break;
    case 'http': // Clash also supports http proxy
      node.type = 'socks5'; // Map http to socks5 for simplicity if needed, or add 'http' to Node type
      node.password = proxy.password;
      node.params = { username: proxy.username };
      break;
    case 'hysteria':
    case 'hysteria2':
    case 'tuic':
    case 'anytls':
      // These types might have specific parameters in Clash that need mapping
      node.params = { ...proxy }; // Keep all original params for now
      break;
    default:
      console.warn(`Unsupported Clash proxy type: ${proxy.type}`);
      return null;
  }

  return node as Node;
}

export async function handleSubscriptionsUpdate(request: Request, env: Env, id: string): Promise<Response> {
  console.log(`[Preview] Starting handleSubscriptionsUpdate for ID: ${id}`);
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
    let nodes: Node[] = [];
    let parsedSuccessfully = false;

    // Try parsing as YAML (Clash config)
    try {
      console.log('[Preview] Attempting to parse content as YAML.');
      const yamlContent = yaml.load(content) as any;
      if (yamlContent && Array.isArray(yamlContent.proxies)) {
        console.log(`[Preview] Found ${yamlContent.proxies.length} proxies in YAML.`);
        nodes = yamlContent.proxies.map((proxy: any) => clashProxyToNode(proxy)).filter(Boolean) as Node[];
        parsedSuccessfully = true;
      } else {
        console.log('[Preview] YAML content does not contain a proxies array.');
      }
    } catch (yamlError) {
      console.warn(`[Preview] Failed to parse content as YAML: ${yamlError instanceof Error ? yamlError.message : String(yamlError)}`);
    }

    // If not parsed as YAML, try Base64 or plain text
    if (!parsedSuccessfully) {
      console.log('[Preview] Attempting to decode content as Base64 or plain text.');
      let decodedContent = '';
      try {
        decodedContent = base64Decode(content);
        console.log('[Preview] Content successfully Base64 decoded.');
      } catch (decodeError) {
        console.warn(`[Preview] Content from ${subscription.url} is not valid Base64, treating as plain text.`);
        decodedContent = content;
      }

      const lines = decodedContent.split(/\r?\n|\r/).filter(line => line.trim() !== '');
      nodes = lines.map(line => parseNodeLink(line)).filter(Boolean) as Node[];
      console.log(`[Preview] Found ${nodes.length} nodes from plain text/Base64.`);
    }

    // Check if content looks like HTML (after other parsing attempts)
    const isHtmlContent = content.trim().startsWith('<') && (content.includes('<html') || content.includes('<body'));
    if (isHtmlContent && nodes.length === 0) {
        throw new Error('Subscription URL returned HTML content instead of subscription data.');
    }

    // If no nodes found and content is not empty, it might be invalid
    if (nodes.length === 0 && content.trim().length > 0) {
        throw new Error('Subscription content is not valid and contains no recognizable node links.');
    }

    subscription.nodeCount = nodes.length;
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
    
    console.error(`[Preview] Failed to update subscription ${id}:`, error);
    return jsonResponse(subscription || { id, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}