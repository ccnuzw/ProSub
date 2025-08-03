import { Node, Subscription } from '@shared/types';
import { parseNodeLink } from '@shared/node-parser';
import * as yaml from 'js-yaml';

// 基础的 Base64 解码函数
export function base64Decode(str: string): string {
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
export function clashProxyToNode(proxy: any): Node | null {
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
    case 'hysteria':
    case 'hysteria2':
      node.password = proxy.password;
      node.params = {
        protocol: proxy.protocol,
        up: proxy.up,
        down: proxy.down,
        sni: proxy.sni,
        skipCertVerify: proxy['skip-cert-verify'],
      };
      break;
    case 'tuic':
      node.password = proxy.uuid;
      node.params = {
        uuid: proxy.uuid,
        password: proxy.password,
        congestion: proxy.congestion,
        udpRelayMode: proxy['udp-relay-mode'],
        sni: proxy.sni,
        skipCertVerify: proxy['skip-cert-verify'],
      };
      break;
    default:
      // For other types, just store the original parameters
      break;
  }

  return node as Node;
}

// 解析订阅内容
export async function parseSubscriptionContent(content: string, url: string): Promise<Node[]> {
  let nodes: Node[] = [];
  let parsedSuccessfully = false;

  // Try parsing as YAML (Clash config)
  try {
    console.log('[Parser] Attempting to parse content as YAML.');
    const yamlContent = yaml.load(content) as any;
    if (yamlContent && Array.isArray(yamlContent.proxies)) {
      console.log(`[Parser] Found ${yamlContent.proxies.length} proxies in YAML.`);
      nodes = yamlContent.proxies.map((proxy: any) => clashProxyToNode(proxy)).filter(Boolean) as Node[];
      parsedSuccessfully = true;
    } else {
      console.log('[Parser] YAML content does not contain a proxies array.');
    }
  } catch (yamlError) {
    console.warn(`[Parser] Failed to parse content as YAML: ${yamlError instanceof Error ? yamlError.message : String(yamlError)}`);
  }

  // If not parsed as YAML, try Base64 or plain text
  if (!parsedSuccessfully) {
    console.log('[Parser] Attempting to decode content as Base64 or plain text.');
    let decodedContent = '';
    try {
      decodedContent = base64Decode(content);
      console.log('[Parser] Content successfully Base64 decoded.');
    } catch (decodeError) {
      console.warn(`[Parser] Content from ${url} is not valid Base64, treating as plain text.`);
      decodedContent = content;
    }

    const lines = decodedContent.split(/\r?\n|\r/).filter(line => line.trim() !== '');
    nodes = lines.map(line => parseNodeLink(line)).filter(Boolean) as Node[];
    console.log(`[Parser] Found ${nodes.length} nodes from plain text/Base64.`);
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

  return nodes;
}

// 更新订阅状态
export async function updateSubscriptionStatus(
  subscription: Subscription, 
  nodes: Node[], 
  error?: string
): Promise<Subscription> {
  subscription.nodeCount = nodes.length;
  subscription.lastUpdated = new Date().toISOString();
  subscription.error = error;
  return subscription;
} 