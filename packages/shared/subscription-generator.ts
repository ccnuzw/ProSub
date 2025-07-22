import { Profile, Node, Env } from './types';
import * as yaml from 'js-yaml';

// Import all the rule/group generators
import { getClashProxyGroups } from './clash-proxy-groups';
import { clashRules, ruleProviders } from './clash-rules';
import { getSurgeProxyGroups } from './surge-proxy-groups';
import { surgeRules } from './surge-rules';
import { getQuantumultXPolicies } from './quantumult-x-policies';
import { quantumultXRules } from './quantumult-x-rules';
import { getLoonProxyGroups } from './loon-proxy-groups';
import { loonRules } from './loon-rules';
import { getSingBoxOutbounds } from './sing-box-outbounds';
import { getSingBoxRoute } from './sing-box-rules';
import { parseNodeLink } from './node-parser';

// --- Node to URI Converter ---
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

            // *** FIX IS HERE ***
            case 'vless':
            case 'vless-reality':
            case 'trojan':
            case 'socks5':
            case 'tuic':
            case 'hysteria':
            case 'hysteria2':
            case 'anytls': // <--- 新增 anytls
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
                return `ss://${encodedCreds}@${node.server}:${node.port}#${encodedName}`;
            
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

function generateShadowrocketSubscription(nodes: Node[]): Response {
    const nodeLinks = nodes.map(convertNodeToUri).filter(Boolean);
    if (nodeLinks.length === 0) return new Response('', { status: 200 });
    const content = nodeLinks.join('\n');
    return new Response(content, { 
        headers: { 
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="prosub_shadowrocket.txt"`
        } 
    });
}

function generateClashSubscription(nodes: Node[]): Response {
    const proxies = nodes.map(node => {
        const proxy: any = {
            name: node.name,
            type: node.type,
            server: node.server,
            port: node.port,
            password: (node.type !== 'vmess' && node.type !== 'vless' && node.type !== 'vless-reality') ? node.password : undefined,
            uuid: (node.type === 'vmess' || node.type === 'vless' || node.type === 'vless-reality') ? node.password : undefined,
            cipher: node.type === 'ss' ? node.params?.method : undefined,
            tls: node.params?.tls === 'tls' || node.params?.tls === true ? true : undefined,
            network: node.params?.net,
            'ws-opts': node.params?.net === 'ws' ? { path: node.params?.path, headers: { Host: node.params?.host } } : undefined,
        };
        // *** FIX IS HERE ***
        if (node.type === 'vless-reality') {
            proxy.flow = node.params?.flow || 'xtls-rprx-vision';
            proxy.servername = node.params?.sni;
            proxy['reality-opts'] = { // Changed to bracket notation
                'public-key': node.params?.pbk,
                'short-id': node.params?.sid || '',
            };
        }
        Object.keys(proxy).forEach(key => proxy[key] === undefined && delete proxy[key]);
        return proxy;
    });

    const proxyGroups = getClashProxyGroups(nodes);
    const clashConfig = {
        'port': 7890,
        'socks-port': 7891,
        'allow-lan': false,
        'mode': 'rule',
        'log-level': 'info',
        'external-controller': '127.0.0.1:9090',
        'proxies': proxies,
        'proxy-groups': proxyGroups,
        'rule-providers': ruleProviders,
        'rules': clashRules,
    };
    const yamlString = yaml.dump(clashConfig, { sortKeys: false });
    return new Response(yamlString, { 
        headers: { 
            'Content-Type': 'text/yaml; charset=utf-8',
            'Content-Disposition': `attachment; filename="prosub_clash.yaml"`
        } 
    });
}

// ... other generators ...
function generateSurgeSubscription(nodes: Node[]): Response {
    const proxyLines = nodes.map(node => {
        let line = `${node.name} = ${node.type}, ${node.server}, ${node.port}, password=${node.password}`;
        if(node.type === 'ss') line += `, method=${node.params?.method}`;
        if(node.params?.tls) line += `, tls=true`;
        if(node.params?.net === 'ws') line += `, ws=true, ws-path=${node.params.path}, ws-headers=Host:${node.params.host}`;
        return line;
    });
    const content = `[Proxy]\n${proxyLines.join('\n')}\n\n[Proxy Group]\n${getSurgeProxyGroups(nodes).join('\n')}\n\n[Rule]\n${surgeRules.join('\n')}`;
    return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
function generateQuantumultXSubscription(nodes: Node[]): Response {
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
    const content = `[server_local]\n${serverLines.join('\n')}\n\n[filter_remote]\n${quantumultXRules.join('\n')}\n\n[policy]\n${getQuantumultXPolicies(nodes).join('\n')}`;
    return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
function generateLoonSubscription(nodes: Node[]): Response {
    const proxyLines = nodes.map(node => `${node.name} = ${node.type}, ${node.server}, ${node.port}, password=${node.password}`);
    const content = `[Proxy]\n${proxyLines.join('\n')}\n\n[Proxy Group]\n${getLoonProxyGroups(nodes).join('\n')}\n\n[Rule]\n${loonRules.join('\n')}`;
    return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
function generateSingBoxSubscription(nodes: Node[]): Response {
    const outbounds = getSingBoxOutbounds(nodes);
    const route = getSingBoxRoute();
    const singboxConfig = {
        log: { level: 'info' },
        dns: { servers: [{ address: 'https://dns.google/dns-query' }] },
        inbounds: [
            { type: 'tun', tag: 'tun-in', interface_name: 'tun0' },
            { type: 'mixed', tag: 'mixed-in', listen: '0.0.0.0', listen_port: 7890 }
        ],
        outbounds,
        route,
    };
    return new Response(JSON.stringify(singboxConfig, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}


// --- Data Fetching Logic ---
async function fetchNodesFromSubscription(url: string): Promise<string[]> {
    try {
        const response = await fetch(url, { headers: { 'User-Agent': 'ProSub/1.0' } });
        if (!response.ok) return [];
        const content = await response.text();
        const decodedContent = atob(content);
        return decodedContent.split(/[\r\n]+/).filter(Boolean);
    } catch (error) {
        console.error(`Failed to fetch subscription from ${url}:`, error);
        return [];
    }
}

async function fetchAllNodes(profile: Profile, env: Env): Promise<Node[]> {
    const KV = env.KV; 
    const nodeIds = profile.nodes || [];
    const subIds = profile.subscriptions || [];

    const allNodesJson = await KV.get('ALL_NODES');
    const allManualNodes: Record<string, Node> = allNodesJson ? JSON.parse(allNodesJson) : {};
    const manualNodes = nodeIds
        .map(id => allManualNodes[id])
        .filter(Boolean); 

    const subsJson = await Promise.all(subIds.map(id => KV.get(`subscription:${id}`)));
    const subscriptions = subsJson.filter(Boolean).map(json => JSON.parse(json as string));

    const subLinksPromises = subscriptions.map(sub => fetchNodesFromSubscription(sub.url));
    const subLinksArrays = await Promise.all(subLinksPromises);
    const allSubLinks = subLinksArrays.flat();
    const parsedSubNodes = allSubLinks.map(link => parseNodeLink(link)).filter(Boolean) as Node[];

    return [...manualNodes, ...parsedSubNodes];
}


// --- Main Handler ---
export async function generateSubscriptionResponse(request: Request, profile: Profile, env: Env): Promise<Response> {
    const allNodes = await fetchAllNodes(profile, env);
    
    let targetClient = new URL(request.url).searchParams.get('target')?.toLowerCase();
    if (!targetClient) {
        const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
        if (userAgent.includes('clash')) targetClient = 'clash';
        else if (userAgent.includes('surge')) targetClient = 'surge';
        else if (userAgent.includes('quantumult x')) targetClient = 'quantumultx';
        else if (userAgent.includes('loon')) targetClient = 'loon';
        else if (userAgent.includes('sing-box')) targetClient = 'sing-box';
        else if (userAgent.includes('shadowrocket')) targetClient = 'shadowrocket';
        else targetClient = 'base64';
    }

    switch (targetClient) {
        case 'clash':
        case 'mihomo':
            return generateClashSubscription(allNodes);
        case 'surge':
            return generateSurgeSubscription(allNodes);
        case 'quantumultx':
            return generateQuantumultXSubscription(allNodes);
        case 'loon':
            return generateLoonSubscription(allNodes);
        case 'sing-box':
            return generateSingBoxSubscription(allNodes);
        case 'shadowrocket':
            return generateShadowrocketSubscription(allNodes);
        default:
            return generateBase64Subscription(allNodes);
    }
}