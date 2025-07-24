import { Profile, Node, Env, RuleSetConfig, Subscription, SubscriptionRule } from './types';
import * as yaml from 'js-yaml';
import * as ruleSets from './rulesets';
import { parseClashYaml } from './clash-parser';
import { parseNodeLink } from './node-parser';


// Helper to encode base64 in a URL-safe way
function base64Encode(str: string): string {
    // For SSR, which uses a specific URL-safe Base64 variant
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

            case 'vless':
            case 'vless-reality':
            case 'trojan':
            case 'socks5':
            case 'tuic':
            case 'hysteria':
            case 'hysteria2':
            case 'anytls':
                const protocol = node.type === 'vless-reality' ? 'vless' : node.type;
                const url = new URL(`${protocol}://${node.password || ''}@${node.server}:${node.port}`);
                url.hash = encodedName;
                if (node.params) {
                    for (const key in node.params) {
                        url.searchParams.set(key, node.params[key]);
                    }
                }
                return url.toString();

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

            default:
                console.warn(`不支持的节点类型: ${node.type}`);
                return '';
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
                proxy.network = node.params?.network || node.params?.net;
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
                proxy.network = node.params?.network || node.params?.net;
                proxy.flow = node.params?.flow;
                 if (proxy.network === 'ws') {
                    proxy['ws-opts'] = {
                        path: node.params?.['ws-path'] || node.params?.path || '/',
                        headers: node.params?.['ws-headers'] || { Host: node.params?.host || node.server },
                    };
                }
                if (node.type === 'vless-reality') {
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
                proxy['skip-cert-verify'] = node.params?.['skip-cert-verify'] ?? node.params?.allowInsecure === 'true';
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
    
    // Ensure proxy-groups exist and correctly reference nodes
    if (finalConfig['proxy-groups'] && Array.isArray(finalConfig['proxy-groups'])) {
        const nodeNames = nodes.map(n => n.name);
        finalConfig['proxy-groups'].forEach(group => {
            if (group.proxies) {
                // This is a simple replacement, more complex logic might be needed if you want to merge
                const placeholderIndex = group.proxies.indexOf('auto'); // A placeholder to indicate where nodes should go
                if (placeholderIndex > -1) {
                    group.proxies.splice(placeholderIndex, 1, ...nodeNames);
                }
            }
        });
    }

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

async function generateSurgeSubscription(nodes: Node[], ruleConfig?: RuleSetConfig): Promise<Response> {
    const proxyLines = nodes.map(node => {
        let line = `${node.name} = ${node.type}, ${node.server}, ${node.port}, password=${node.password}`;
        if(node.type === 'ss') line += `, method=${node.params?.method}`;
        if(node.params?.tls) line += `, tls=true`;
        if(node.params?.net === 'ws') line += `, ws=true, ws-path=${node.params.path}, ws-headers=Host:${node.params.host}`;
        return line;
    });

    let remoteRules = {};
    if (ruleConfig?.type === 'remote' && ruleConfig.url) {
        const fetchedRules = await fetchRemoteRules(ruleConfig.url);
        if (fetchedRules) {
            remoteRules = fetchedRules;
        } else {
            remoteRules = ruleSets.getSurgeDefaultRules(nodes);
            console.warn(`远程 Surge 规则获取失败，已回退至内置规则。`);
        }
    } else if (ruleConfig?.id === 'lite') {
        remoteRules = ruleSets.getSurgeLiteRules(nodes);
    } else {
        remoteRules = ruleSets.getSurgeDefaultRules(nodes);
    }

    const content = `[Proxy]\n${proxyLines.join('\n')}\n\n[Proxy Group]\n${remoteRules['proxy-groups'].join('\n')}\n\n[Rule]\n${remoteRules['rules'].join('\n')}`;
    return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
async function generateQuantumultXSubscription(nodes: Node[], ruleConfig?: RuleSetConfig): Promise<Response> {
    const serverLines = nodes.map(node => {
        let line = '';
        const remark = `remark=${node.name}`;
        const tag = `tag=${node.name}`;
        switch (node.type) {
            case 'ss':
                line = `shadowsocks=${node.server}:${node.port}, method=${node.params?.method}, password=${node.password}, ${remark}`;
                break;
            case 'vmess':
                const tls = (node.params?.tls) ? ', obfs=wss' : '';
                line = `vmess=${node.server}:${node.port}, method=aes-128-gcm, password=${node.password}, obfs=ws, obfs-uri=${node.params?.path}, obfs-header="Host: ${node.params?.host}"${tls}, ${remark}`;
                break;
            case 'trojan':
                line = `trojan=${node.server}:${node.port}, password=${node.password}, ${remark}`;
                break;
        }
        return line ? `${line}, ${tag}` : '';
    }).filter(Boolean);

    let remoteRules = {};
    if (ruleConfig?.type === 'remote' && ruleConfig.url) {
        const fetchedRules = await fetchRemoteRules(ruleConfig.url);
        if (fetchedRules) {
            remoteRules = fetchedRules;
        } else {
            remoteRules = ruleSets.getQuantumultXDefaultRules(nodes);
            console.warn(`远程 Quantumult X 规则获取失败，已回退至内置规则。`);
        }
    } else if (ruleConfig?.id === 'lite') {
        remoteRules = ruleSets.getQuantumultXLiteRules(nodes);
    } else {
        remoteRules = ruleSets.getQuantumultXDefaultRules(nodes);
    }

    const content = `[server_local]\n${serverLines.join('\n')}\n\n[filter_remote]\n${remoteRules['filter_remote'].join('\n')}\n\n[policy]\n${remoteRules['policy'].join('\n')}`;
    return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
async function generateLoonSubscription(nodes: Node[], ruleConfig?: RuleSetConfig): Promise<Response> {
    const proxyLines = nodes.map(node => `${node.name} = ${node.type}, ${node.server}, ${node.port}, password=${node.password}`);

    let remoteRules = {};
    if (ruleConfig?.type === 'remote' && ruleConfig.url) {
        const fetchedRules = await fetchRemoteRules(ruleConfig.url);
        if (fetchedRules) {
            remoteRules = fetchedRules;
        } else {
            remoteRules = ruleSets.getLoonDefaultRules(nodes);
            console.warn(`远程 Loon 规则获取失败，已回退至内置规则。`);
        }
    } else if (ruleConfig?.id === 'lite') {
        remoteRules = ruleSets.getLoonLiteRules(nodes);
    } else {
        remoteRules = ruleSets.getLoonDefaultRules(nodes);
    }

    const content = `[Proxy]\n${proxyLines.join('\n')}\n\n[Proxy Group]\n${remoteRules['proxy-groups'].join('\n')}\n\n[Rule]\n${remoteRules['rules'].join('\n')}`;
    return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
async function generateSingBoxSubscription(nodes: Node[], ruleConfig?: RuleSetConfig): Promise<Response> {
    const nodeOutbounds = nodes.map(node => {
        const baseOutbound: any = {
            tag: node.name,
            type: node.type,
            server: node.server,
            server_port: node.port,
        };

        switch (node.type) {
            case 'ss':
                baseOutbound.method = node.params?.method;
                baseOutbound.password = node.password;
                break;
            case 'vmess':
                baseOutbound.uuid = node.password;
                baseOutbound.security = 'auto';
                baseOutbound.alter_id = 0;
                break;
            case 'vless':
                baseOutbound.uuid = node.password;
                baseOutbound.flow = node.params?.flow || '';
                break;
            case 'trojan':
                baseOutbound.password = node.password;
                break;
        }

        if (node.params?.net === 'ws') {
            baseOutbound.transport = {
                type: 'ws',
                path: node.params.path || '/',
                headers: {
                    Host: node.params.host || node.server,
                },
            };
        }

        if (node.params?.tls === 'tls' || node.params?.tls === true) {
            baseOutbound.tls = {
                enabled: true,
                server_name: node.params.host || node.server,
                insecure: node.params.allowInsecure === 'true',
            };
        }

        return baseOutbound;
    });

    let remoteRules = {};
    if (ruleConfig?.type === 'remote' && ruleConfig.url) {
        const fetchedRules = await fetchRemoteRules(ruleConfig.url);
        if (fetchedRules) {
            remoteRules = fetchedRules;
        } else {
            remoteRules = ruleSets.getSingBoxDefaultRules(nodes);
            console.warn(`远程 Sing-Box 规则获取失败，已回退至内置规则。`);
        }
    } else if (ruleConfig?.id === 'lite') {
        remoteRules = ruleSets.getSingBoxLiteRules(nodes);
    } else {
        remoteRules = ruleSets.getSingBoxDefaultRules(nodes);
    }

    const singboxConfig = {
        log: { level: 'info' },
        dns: { servers: [{ address: 'https://dns.google/dns-query' }] },
        inbounds: [
            { type: 'tun', tag: 'tun-in', interface_name: 'tun0' },
            { type: 'mixed', tag: 'mixed-in', listen: '0.0.0.0', listen_port: 7890 }
        ],
        outbounds: [...nodeOutbounds, ...remoteRules.outbounds],
        route: remoteRules.route,
    };
    return new Response(JSON.stringify(singboxConfig, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}


// --- Data Fetching Logic ---
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

    // 智能重命名与去重逻辑
    const combinedNodes = [...manualNodes, ...allSubNodes];
    const finalNodes: Node[] = [];
    const nameCount: Record<string, number> = {};
    const usedNames = new Set<string>();

    // 第一次遍历，预先记录所有已存在的名称
    combinedNodes.forEach(node => {
        usedNames.add(node.name);
    });

    // 第二次遍历，处理重名并生成最终列表
    combinedNodes.forEach(originalNode => {
        let node = { ...originalNode }; // 创建副本以修改名称
        const baseName = node.name;
        
        // 增加节点名的计数
        nameCount[baseName] = (nameCount[baseName] || 0) + 1;

        if (nameCount[baseName] > 1) {
            // 如果是第2个或更多的同名节点，开始寻找新的唯一名称
            let suffix = 2; // 从2开始尝试
            let newName;

            // 循环直到找到一个未被使用的名称
            do {
                newName = `${baseName} ${suffix}`;
                suffix++;
            } while (usedNames.has(newName));
            
            node.name = newName;
            usedNames.add(newName);
        }
        
        finalNodes.push(node);
    });

    // 第三次遍历，去重完全相同的节点 (server, port, password, type)
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
    const allNodes = await fetchAllNodes(profile, env);

    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
    let targetClient = url.searchParams.get('target')?.toLowerCase();

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
}