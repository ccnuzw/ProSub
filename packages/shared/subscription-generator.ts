import { Profile, Node, Env, RuleSetConfig, Subscription, SubscriptionRule } from './types';
import * as yaml from 'js-yaml';
import * as ruleSets from './rulesets';
import { parseClashYaml } from './clash-parser';
import { parseNodeLink } from './node-parser';

// Helper to encode base64 in a URL-safe way
function base64Encode(str: string): string {
    return btoa(unescape(encodeURIComponent(str)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function convertNodeToUri(node: Node): string {
    const encodedName = encodeURIComponent(node.name);
    try {
        switch (node.type) {
            case 'vmess':
                const vmessConfig = {
                    v: "2", ps: node.name, add: node.server, port: node.port, id: node.password,
                    aid: node.params?.aid ?? "0", net: node.params?.net ?? "tcp",
                    type: node.params?.type ?? "none", host: node.params?.host ?? "",
                    path: node.params?.path ?? "", tls: node.params?.tls ?? ""
                };
                return `vmess://${btoa(JSON.stringify(vmessConfig))}`;

            case 'ss':
                const creds = `${node.params?.method}:${node.password}`;
                const encodedCreds = btoa(creds).replace(/=+$/, '');
                const serverAddress = node.server.includes(':')
                    ? `[${node.server}]`
                    : node.server;
                return `ss://${encodedCreds}@${serverAddress}:${node.port}#${encodedName}`;

            case 'ssr':
                const password_base64 = base64Encode(node.password || '');
                const mainInfo = `${node.server}:${node.port}:${node.params?.protocol}:${node.params?.method}:${node.params?.obfs}:${password_base64}`;
                const params = new URLSearchParams();
                params.set('remarks', base64Encode(node.name));
                if (node.params?.obfsparam) params.set('obfsparam', base64Encode(node.params.obfsparam));
                if (node.params?.protoparam) params.set('protoparam', base64Encode(node.params.protoparam));
                const fullInfo = `${mainInfo}/?${params.toString()}`;
                return `ssr://${base64Encode(fullInfo)}`;
            
            case 'vless':
            case 'vless-reality':
            case 'trojan':
            case 'socks5':
            case 'tuic':
            case 'hysteria':
            case 'hysteria2':
            case 'anytls':
            default:
                const protocol = node.type === 'vless-reality' ? 'vless' : node.type;
                const url = new URL(`${protocol}://${node.password || ''}@${node.server}:${node.port}`);
                url.hash = encodedName;
                if (node.params) {
                    for (const key in node.params) {
                        url.searchParams.set(key, node.params[key]);
                    }
                }
                return url.toString();
        }
    } catch (e) {
        console.error(`转换节点到 URI 失败: ${node.name}`, e);
        return '';
    }
}

// --- Subscription Generators ---
function generateBase64Subscription(nodes: Node[]): Response {
    const nodeLinks = nodes.map(convertNodeToUri).filter(Boolean);
    if (nodeLinks.length === 0) return new Response('', { status: 200 });
    const combinedContent = nodeLinks.join('\n');
    const base64Content = btoa(combinedContent);
    return new Response(base64Content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

async function fetchRemoteRules(url: string): Promise<any> {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const text = await response.text();
        try {
            return yaml.load(text);
        } catch (e) {
            return text;
        }
    } catch (e) {
        return null;
    }
}

async function generateClashSubscription(nodes: Node[], ruleConfig?: RuleSetConfig): Promise<Response> {
    const proxies = nodes.map(node => {
        const proxy: any = {
            name: node.name,
            type: node.type,
            server: node.server,
            port: node.port,
        };
        const network = node.params?.net || node.params?.type;
        switch (node.type) {
            case 'ss':
                proxy.password = node.password || node.params?.password;
                proxy.cipher = node.params?.cipher || node.params?.method;
                if (node.params?.udp) proxy.udp = node.params.udp;
                break;
            case 'ssr':
                 proxy.password = node.password || node.params?.password;
                proxy.cipher = node.params?.cipher || node.params?.method;
                proxy.protocol = node.params?.protocol;
                proxy['protocol-param'] = node.params?.protoparam;
                proxy.obfs = node.params?.obfs;
                proxy['obfs-param'] = node.params?.obfsparam;
                break;
            case 'vmess':
                proxy.uuid = node.password || node.params?.uuid;
                proxy.alterId = node.params?.alterId ?? node.params?.aid ?? 0;
                proxy.cipher = node.params?.cipher ?? 'auto';
                proxy.tls = !!(node.params?.tls && node.params.tls !== 'none');
                proxy.network = network;
                if (proxy.network === 'ws') {
                    proxy['ws-opts'] = {
                        path: node.params?.['ws-path'] || node.params?.path || '/',
                        headers: node.params?.['ws-headers'] || { Host: node.params?.host || node.server },
                    };
                }
                if(proxy.tls) {
                    proxy.servername = node.params?.servername || node.params?.host || node.server;
                }
                break;
            case 'vless':
            case 'vless-reality':
                proxy.type = 'vless';
                proxy.uuid = node.password || node.params?.uuid;
                proxy.tls = !!(node.params?.tls && node.params.tls !== 'none');
                proxy.network = network;
                proxy.flow = node.params?.flow;
                 if (proxy.network === 'ws') {
                    proxy['ws-opts'] = {
                        path: node.params?.['ws-path'] || node.params?.path || '/',
                        headers: node.params?.['ws-headers'] || { Host: node.params?.host || node.server },
                    };
                }
                if (node.type === 'vless-reality' || node.params?.security === 'reality') {
                    proxy.servername = node.params?.servername || node.params?.sni;
                    proxy['client-fingerprint'] = node.params?.['client-fingerprint'] || 'chrome';
                    proxy['reality-opts'] = {
                        'public-key': node.params?.['reality-opts']?.['public-key'] || node.params?.pbk,
                        'short-id': node.params?.['reality-opts']?.['short-id'] || node.params?.sid || '',
                    };
                } else if(proxy.tls) {
                     proxy.servername = node.params?.servername || node.params?.sni || node.server;
                }
                break;
            case 'trojan':
                proxy.password = node.password || node.params?.password;
                proxy.sni = node.params?.sni || node.server;
                proxy['skip-cert-verify'] = node.params?.['skip-cert-verify'] ?? (node.params?.allowInsecure === '1' || node.params?.allowInsecure === true);
                
                // ** FIX: Added WebSocket support for Trojan **
                if (network === 'ws') {
                    proxy.network = 'ws';
                    proxy['ws-opts'] = {
                        path: node.params?.path || '/',
                        headers: { Host: node.params?.host || node.server },
                    };
                }
                break;
            case 'hysteria2':
                 proxy.type = 'hysteria2';
                 proxy.password = node.password || node.params?.password;
                 proxy.sni = node.params?.sni || node.server;
                 proxy['skip-cert-verify'] = node.params?.['skip-cert-verify'] === true;
                 break;
            case 'tuic':
                proxy.type = 'tuic';
                proxy.password = node.password || node.params?.password;
                proxy.uuid = node.params?.uuid;
                proxy.sni = node.params?.sni || node.server;
                proxy['skip-cert-verify'] = node.params?.['skip-cert-verify'] === true;
                break;
            default:
                return null;
        }
        Object.keys(proxy).forEach(key => (proxy[key] === undefined || proxy[key] === null) && delete proxy[key]);
        if (proxy['ws-opts']) {
          Object.keys(proxy['ws-opts']).forEach(key => (proxy['ws-opts'][key] === undefined || proxy['ws-opts'][key] === null) && delete proxy['ws-opts'][key]);
        }
        return proxy;
    }).filter(p => p !== null);
    
    let baseConfig: any = {};
    if (ruleConfig?.type === 'remote' && ruleConfig.url) {
        const remoteConfig = await fetchRemoteRules(ruleConfig.url);
        if (remoteConfig && typeof remoteConfig === 'object') {
            baseConfig = remoteConfig;
        } else {
            baseConfig = ruleSets.getClashDefaultRules(nodes);
        }
    } else if (ruleConfig?.id === 'lite') {
        baseConfig = ruleSets.getClashLiteRules(nodes);
    } else {
        baseConfig = ruleSets.getClashDefaultRules(nodes);
    }
    
    const finalConfig = {
        'port': 7890,
        'socks-port': 7891,
        'allow-lan': true,
        'mode': 'rule',
        'log-level': 'info',
        'external-controller': '127.0.0.1:9090',
        ...baseConfig,
        'proxies': proxies,
    };
    
    try {
        const yamlString = yaml.dump(finalConfig, { sortKeys: false, lineWidth: -1 });
        return new Response(yamlString, {
            headers: {
                'Content-Type': 'text/yaml; charset=utf-8',
                'Content-Disposition': `attachment; filename="prosub_clash.yaml"`
            }
        });
    } catch (error) {
        console.error("YAML DUMP FAILED:", error);
        console.error("Problematic Config Object:", JSON.stringify(finalConfig, null, 2));
        return new Response(`Server error: Failed to generate YAML configuration. ${error.message}`, { status: 500 });
    }
}

// --- Data Fetching Logic ---
async function fetchNodesFromSubscription(url: string): Promise<Node[]> {
    try {
        const response = await fetch(url, { headers: { 'User-Agent': 'ProSub/1.0' } });
        if (!response.ok) {
            console.error(`从 ${url} 获取订阅失败，状态码: ${response.status}`);
            return [];
        }
        const content = await response.text();
        let nodes: Node[] = [];
        nodes = parseClashYaml(content);
        if (nodes.length === 0) {
            let decodedContent = '';
            try {
                decodedContent = atob(decodeURIComponent(content.replace(/_/g, '/').replace(/-/g, '+')));
            } catch (e) {
                decodedContent = content;
            }
            const lines = decodedContent.split(/[\r\n]+/).filter(Boolean);
            nodes = lines.map(link => parseNodeLink(link)).filter(Boolean) as Node[];
        }
        return nodes;
    } catch (error) {
        console.error(`从 ${url} 获取订阅时发生错误:`, error);
        return [];
    }
}

function applySubscriptionRules(nodes: Node[], rules: SubscriptionRule[] = []): Node[] {
  if (!rules || rules.length === 0) return nodes;
  let filteredNodes = nodes;
  const includeRules = rules.filter(r => r.type === 'include');
  const excludeRules = rules.filter(r => r.type === 'exclude');
  if (includeRules.length > 0) {
    filteredNodes = filteredNodes.filter(node => 
      includeRules.some(rule => new RegExp(rule.pattern, 'i').test(node[rule.field]))
    );
  }
  if (excludeRules.length > 0) {
    filteredNodes = filteredNodes.filter(node => 
      !excludeRules.some(rule => new RegExp(rule.pattern, 'i').test(node[rule.field]))
    );
  }
  return filteredNodes;
}

async function fetchAllNodes(profile: Profile, env: Env): Promise<Node[]> {
    const KV = env.KV;
    const nodeIds = profile.nodes || [];
    const profileSubs = profile.subscriptions || [];
    const allNodesJson = await KV.get('ALL_NODES');
    const allManualNodes: Record<string, Node> = allNodesJson ? JSON.parse(allNodesJson) : {};
    const manualNodes = nodeIds.map(id => allManualNodes[id]).filter(Boolean);
    const allSubsJson = await KV.get('ALL_SUBSCRIPTIONS');
    const allSubscriptions: Record<string, Subscription> = allSubsJson ? JSON.parse(allSubsJson) : {};
    const subscriptionFetchPromises = profileSubs.map(async (profileSub) => {
        const subscription = allSubscriptions[profileSub.id];
        if (subscription) {
            let nodesFromSub = await fetchNodesFromSubscription(subscription.url);
            return applySubscriptionRules(nodesFromSub, profileSub.rules);
        }
        return [];
    });
    const results = await Promise.all(subscriptionFetchPromises);
    const allSubNodes = results.flat();
    const combinedNodes = [...manualNodes, ...allSubNodes];
    const finalNodes: Node[] = [];
    const nameCount: Record<string, number> = {};
    const usedNames = new Set<string>();
    combinedNodes.forEach(node => {
        usedNames.add(node.name);
    });
    combinedNodes.forEach(originalNode => {
        let node = { ...originalNode };
        const baseName = node.name;
        nameCount[baseName] = (nameCount[baseName] || 0) + 1;
        if (nameCount[baseName] > 1) {
            let suffix = 2;
            let newName;
            do {
                newName = `${baseName} ${suffix}`;
                suffix++;
            } while (usedNames.has(newName));
            node.name = newName;
            usedNames.add(newName);
        }
        finalNodes.push(node);
    });
    const uniqueNodesMap = new Map<string, Node>();
    finalNodes.forEach(node => {
        const uniqueKey = `${node.server}:${node.port}:${node.password || ''}:${node.type}`;
        if (!uniqueNodesMap.has(uniqueKey)) {
            uniqueNodesMap.set(uniqueKey, node);
        }
    });
    return Array.from(uniqueNodesMap.values());
}

// --- Main Handler ---
export async function generateSubscriptionResponse(request: Request, profile: Profile, env: Env): Promise<Response> {
    try {
        const allNodes = await fetchAllNodes(profile, env);
        const url = new URL(request.url);
        const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
        let targetClient = url.searchParams.get('target')?.toLowerCase();

        if (url.searchParams.has('clash')) {
            targetClient = 'clash';
        } else if (url.searchParams.has('surge')) {
            targetClient = 'surge';
        } else if (url.searchParams.has('quantumultx')) {
            targetClient = 'quantumultx';
        } else if (url.searchParams.has('loon')) {
            targetClient = 'loon';
        } else if (url.searchParams.has('sing-box')) {
            targetClient = 'sing-box';
        } else if (url.searchParams.has('base64')) {
            targetClient = 'base64';
        }

        if (!targetClient) {
            if (userAgent.includes('clash')) targetClient = 'clash';
            else if (userAgent.includes('surge')) targetClient = 'surge';
            else if (userAgent.includes('quantumult x')) targetClient = 'quantumultx';
            else if (userAgent.includes('loon')) targetClient = 'loon';
            else if (userAgent.includes('sing-box')) targetClient = 'sing-box';
            else if (userAgent.includes('shadowrocket')) targetClient = 'shadowrocket';
            else targetClient = 'base64';
        }

        const ruleConfig = profile.ruleSets ? profile.ruleSets[targetClient] : undefined;

        switch (targetClient) {
            case 'clash':
            case 'mihomo':
                return await generateClashSubscription(allNodes, ruleConfig);
            case 'surge':
                return await generateSurgeSubscription(allNodes, ruleConfig);
            case 'quantumultx':
                return await generateQuantumultXSubscription(allNodes, ruleConfig);
            case 'loon':
                return await generateLoonSubscription(allNodes, ruleConfig);
            case 'sing-box':
                return await generateSingBoxSubscription(allNodes, ruleConfig);
            case 'shadowrocket':
                return generateBase64Subscription(allNodes);
            default:
                return generateBase64Subscription(allNodes);
        }
    } catch (error) {
        console.error("Unhandled error in generateSubscriptionResponse:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new Response(`An unexpected server error occurred. ${errorMessage}`, { status: 500 });
    }
}