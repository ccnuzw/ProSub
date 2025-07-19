// src/app/api/subscribe/[profile_id]/route.ts

export const runtime = 'edge';

import { NextResponse, NextRequest } from 'next/server';
import { Profile, Node, Subscription } from '@/types';
import { Buffer } from 'buffer';
import { parseNodeLink } from '@/lib/node-parser';

const getKV = () => {
  // @ts-ignore
  return process.env.KV as KVNamespace;
};

// --- 核心數據獲取函數 ---

async function getProfile(KV: KVNamespace, profileId: string): Promise<Profile | null> {
  const profileJson = await KV.get(`profile:${profileId}`);
  return profileJson ? JSON.parse(profileJson) : null;
}

async function getNodesFromKV(KV: KVNamespace, nodeIds: string[]): Promise<Node[]> {
  if (!nodeIds || nodeIds.length === 0) return [];
  const nodesJson = await Promise.all(nodeIds.map(id => KV.get(`node:${id}`)));
  return nodesJson.filter(Boolean).map(json => JSON.parse(json as string));
}

async function getSubscriptions(KV: KVNamespace, subIds: string[]): Promise<Subscription[]> {
  if (!subIds || subIds.length === 0) return [];
  const subsJson = await Promise.all(subIds.map(id => KV.get(`subscription:${id}`)));
  return subsJson.filter(Boolean).map(json => JSON.parse(json as string));
}

async function fetchAllNodes(KV: KVNamespace, profile: Profile): Promise<Node[]> {
    // 1. 獲取手動添加的節點
    const manualNodes = await getNodesFromKV(KV, profile.nodes);

    // 2. 獲取並解析訂閱中的節點
    const subscriptions = await getSubscriptions(KV, profile.subscriptions);
    const subLinksPromises = subscriptions.map(sub => fetchNodesFromSubscription(sub.url));
    const subLinksArrays = await Promise.all(subLinksPromises);
    const allSubLinks = subLinksArrays.flat();
    
    const parsedSubNodes = allSubLinks.map(link => parseNodeLink(link)).filter(Boolean) as Node[];

    // 3. 合併所有節點
    return [...manualNodes, ...parsedSubNodes];
}

async function fetchNodesFromSubscription(url: string): Promise<string[]> {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'ProSub/1.0' } });
    if (!response.ok) return [];
    const content = await response.text();
    const decodedContent = Buffer.from(content, 'base64').toString('utf8');
    return decodedContent.split(/[\r\n]+/).filter(Boolean);
  } catch (error) {
    console.error(`Failed to fetch subscription from ${url}:`, error);
    return [];
  }
}

async function recordTraffic(KV: KVNamespace, profileId: string) {
  try {
    const timestamp = new Date().toISOString();
    const key = `traffic:${profileId}:${timestamp}`;
    await KV.put(key, JSON.stringify({ timestamp, profileId }));
  } catch (error) {
    console.error('Failed to record traffic:', error);
  }
}
// --- 各客戶端配置生成器 ---

/**
 * 通用格式 (Base64) - 適用於 V2RayN, NekoBox 等
 */
function generateBase64Subscription(nodes: Node[]): Response {
    const nodeLinks = nodes.map(convertNodeToUri).filter(Boolean);
    if (nodeLinks.length === 0) return new Response('', { status: 200 });
    const combinedContent = nodeLinks.join('\n');
    const base64Content = Buffer.from(combinedContent).toString('base64');
    return new Response(base64Content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

/**
 * Clash / Mihomo 格式 (YAML)
 */
function generateClashSubscription(nodes: Node[]): Response {
    const proxies = nodes.map(node => {
        const proxy: any = {
            name: node.name,
            type: node.type,
            server: node.server,
            port: node.port,
            ...(node.params || {})
        };
        if (node.password) {
            if (proxy.type === 'vmess' || proxy.type === 'vless') {
                proxy.uuid = node.password;
            } else {
                proxy.password = node.password;
            }
        }
        if (proxy.type === 'ss' && proxy.method) {
            proxy.cipher = proxy.method;
        }
        return proxy;
    });

    let yaml = 'proxies:\n';
    proxies.forEach(p => {
        yaml += `  - ${JSON.stringify(p)}\n`;
    });
    return new Response(yaml, { headers: { 'Content-Type': 'text/yaml; charset=utf-8' } });
}

/**
 * Surge 格式 (INI)
 */
function generateSurgeSubscription(nodes: Node[]): Response {
    const lines = nodes.map(node => {
        const params = new URLSearchParams(node.params as any);
        let line = `${node.name} = ${node.type}, ${node.server}, ${node.port}`;
        if (node.password) params.set('password', node.password);
        if (node.type === 'ss' && node.params?.method) params.set('encrypt-method', node.params.method);
        // ... 可根據 Surge 文檔添加更多參數轉換
        const paramString = params.toString();
        if (paramString) line += `, ${paramString.replace(/&/g, ', ')}`;
        return line;
    });
    const content = `[Proxy]\n${lines.join('\n')}`;
    return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

/**
 * Loon / Quantumult X 格式 (通用鏈接列表)
 */
function generateLoonOrQuantumultXSubscription(nodes: Node[]): Response {
    const nodeLinks = nodes.map(convertNodeToUri).filter(Boolean);
    if (nodeLinks.length === 0) return new Response('', { status: 200 });
    const content = nodeLinks.join('\n');
    return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

/**
 * 節點對象到分享鏈接的轉換器
 */
function convertNodeToUri(node: Node): string {
    const encodedName = encodeURIComponent(node.name);
    try {
        switch (node.type) {
            case 'vmess':
                const vmessConfig = { v: "2", ps: node.name, add: node.server, port: node.port, id: node.password, ...node.params };
                return `vmess://${Buffer.from(JSON.stringify(vmessConfig)).toString('base64')}`;
            case 'vless':
            case 'trojan':
            case 'socks5':
            case 'tuic':
            case 'hysteria':
            case 'hysteria2':
                const url = new URL(`${node.type}://${node.server}:${node.port}`);
                if (node.password) url.username = node.password;
                url.hash = encodedName;
                if (node.params) {
                    for (const key in node.params) {
                        url.searchParams.set(key, node.params[key]);
                    }
                }
                return url.toString();
            case 'ss':
                const creds = `${node.params?.method}:${node.password}`;
                const encodedCreds = Buffer.from(creds).toString('base64').replace(/=+$/, '');
                return `ss://${encodedCreds}@${node.server}:${node.port}#${encodedName}`;
            default:
                return '';
        }
    } catch (e) {
        console.error(`Failed to convert node to URI: ${node.name}`, e);
        return '';
    }
}

/**
 * 為 V2RayN, NekoBox 等客戶端生成通用的 Base64 編碼訂閱
 */
function generateBase64Subscription(nodes: Node[], subLinks: string[]): Response {
    const manualNodeLinks = nodes.map(convertNodeToUri).filter(Boolean);
    const allNodeLinks = [...manualNodeLinks, ...subLinks];
    if (allNodeLinks.length === 0) return new Response('', { status: 200 });

    const combinedContent = allNodeLinks.join('\n');
    const base64Content = Buffer.from(combinedContent).toString('base64');
    return new Response(base64Content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

/**
 * 為 Clash 等客戶端生成 YAML 格式的配置文件
 */
function generateClashSubscription(nodes: Node[], profileName: string): Response {
    const proxies = nodes.map(node => {
        const proxy: any = {
            name: node.name,
            type: node.type,
            server: node.server,
            port: node.port,
            password: node.password,
            ...node.params
        };
        // Clash vmess/vless 的 password 字段名為 uuid
        if(proxy.type === 'vmess' || proxy.type === 'vless'){
            proxy.uuid = proxy.password;
            delete proxy.password;
        }
        // Clash ss 的 password 字段名為 password
        if(proxy.type === 'ss' && proxy.params?.method){
            proxy.cipher = proxy.params.method;
        }
        return proxy;
    });

    const config = {
        'port': 7890,
        'socks-port': 7891,
        'allow-lan': false,
        'mode': 'Rule',
        'log-level': 'info',
        'external-controller': '127.0.0.1:9090',
        'proxies': proxies,
        'proxy-groups': [
            {
                'name': 'PROXY',
                'type': 'select',
                'proxies': proxies.map(p => p.name)
            }
        ],
        'rules': ['MATCH,PROXY']
    };
    
    // 簡易的 YAML 轉換
    let yamlString = '';
    const toYaml = (obj: any, indent = 0) => {
        const space = ' '.repeat(indent);
        if (Array.isArray(obj)) {
            obj.forEach(item => {
                yamlString += `${space}- ${JSON.stringify(item)}\n`;
            });
        } else {
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    yamlString += `${space}${key}:\n`;
                    toYaml(obj[key], indent + 2);
                } else {
                    yamlString += `${space}${key}: ${JSON.stringify(obj[key])}\n`;
                }
            }
        }
    };
    
    // 更手動和精確的 YAML 格式化
    yamlString += `port: 7890\n`;
    yamlString += `socks-port: 7891\n`;
    yamlString += `allow-lan: false\n`;
    yamlString += `mode: Rule\n`;
    yamlString += `log-level: info\n`;
    yamlString += `external-controller: '127.0.0.1:9090'\n`;
    yamlString += `proxies:\n`;
    proxies.forEach(p => {
        yamlString += `  - ${JSON.stringify(p)}\n`;
    });
    yamlString += `proxy-groups:\n`;
    yamlString += `  - name: PROXY\n`;
    yamlString += `    type: select\n`;
    yamlString += `    proxies:\n`;
    proxies.forEach(p => {
        yamlString += `      - ${p.name}\n`;
    });
    yamlString += `rules:\n  - MATCH,PROXY\n`;


    return new Response(yamlString, { headers: { 'Content-Type': 'text/yaml; charset=utf-8' } });
}


// --- 主路由處理器 ---

export async function GET(request: NextRequest, { params }: { params: { profile_id: string } }) {
  try {
    const KV = getKV();
    const profile = await getProfile(KV, params.profile_id);
    if (!profile) return new Response('Profile not found', { status: 404 });

    await recordTraffic(KV, params.profile_id);
    const url = new URL(request.url);
    const targetClient = url.searchParams.get('target')?.toLowerCase();

    const allNodes = await fetchAllNodes(KV, profile);

    switch (targetClient) {
        case 'clash':
        case 'mihomo':
            return generateClashSubscription(allNodes);
        case 'surge':
            return generateSurgeSubscription(allNodes);
        case 'loon':
        case 'quantumultx': // Quantumult X 和 Loon 都可以直接使用原始鏈接列表
            return generateLoonOrQuantumultXSubscription(allNodes);
        default:
            // 默認返回通用 Base64 格式
            return generateBase64Subscription(allNodes);
    }

  } catch (error) {
    console.error(`Failed to generate subscription for profile ${params.profile_id}:`, error);
    return new Response('Failed to generate subscription', { status: 500 });
  }
}