// src/lib/subscription-generator.ts

import { Profile, Node } from '@/types';
import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'buffer';
import * as yaml from 'js-yaml';

// Import all the rule/group generators
import { getClashProxyGroups } from '@/lib/clash-proxy-groups';
import { clashRules, ruleProviders } from '@/lib/clash-rules';
import { getSurgeProxyGroups } from '@/lib/surge-proxy-groups';
import { surgeRules } from '@/lib/surge-rules';
import { getQuantumultXPolicies } from '@/lib/quantumult-x-policies';
import { quantumultXRules } from '@/lib/quantumult-x-rules';
import { getLoonProxyGroups } from '@/lib/loon-proxy-groups';
import { loonRules } from '@/lib/loon-rules';
import { getSingBoxOutbounds } from '@/lib/sing-box-outbounds';
import { getSingBoxRoute } from '@/lib/sing-box-rules';
import { parseNodeLink } from '@/lib/node-parser';

// --- Node to URI Converter ---
function convertNodeToUri(node: Node): string {
    const encodedName = encodeURIComponent(node.name);
    try {
        switch (node.type) {
            case 'vmess':
                const vmessConfig = {
                    v: "2",
                    ps: node.name,
                    add: node.server,
                    port: node.port,
                    id: node.password,
                    aid: node.params?.aid ?? "0",
                    net: node.params?.net ?? "tcp",
                    type: node.params?.type ?? "none",
                    host: node.params?.host ?? "",
                    path: node.params?.path ?? "",
                    tls: node.params?.tls ?? ""
                };
                return `vmess://${Buffer.from(JSON.stringify(vmessConfig), 'utf8').toString('base64')}`;
            case 'vless':
            case 'trojan':
                const url = new URL(`${node.type}://${node.password}@${node.server}:${node.port}`);
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

// --- Subscription Generators ---
function generateBase64Subscription(nodes: Node[]): Response {
    const nodeLinks = nodes.map(convertNodeToUri).filter(Boolean);
    if (nodeLinks.length === 0) return new Response('', { status: 200 });
    const combinedContent = nodeLinks.join('\n');
    const base64Content = Buffer.from(combinedContent).toString('base64');
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
            password: (node.type !== 'vmess' && node.type !== 'vless') ? node.password : undefined,
            uuid: (node.type === 'vmess' || node.type === 'vless') ? node.password : undefined,
            cipher: node.type === 'ss' ? node.params?.method : undefined,
            tls: node.params?.tls === 'tls' || node.params?.tls === true ? true : undefined,
            network: node.params?.net,
            'ws-opts': node.params?.net === 'ws' ? { path: node.params?.path, headers: { Host: node.params?.host } } : undefined,
        };
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
        'external-controller': '127.0.0.0.1:9090',
        'proxies': proxies,
        'proxy-groups': proxyGroups,
        'rule-providers': ruleProviders,
        'rules': clashRules,
    };
    const yamlString = yaml.dump(clashConfig, { sortKeys: false });
    return new Response(yamlString, { 
        headers: { 
            'Content-Type': 'text/yaml; charset=utf-8',
            'Content-Disposition': `attachment; filename="prosub_clash_acl4ssr.yaml"`
        } 
    });
}

// ... other generators (Surge, QuantumultX, Loon, SingBox) go here, copied from the original file ...
function generateSurgeSubscription(nodes: Node[]): Response {
    const proxyLines = nodes.map(node => {
        const params = new URLSearchParams();
        if (node.password) {
            params.set('password', node.password);
        }
        if (node.type === 'ss' && node.params?.method) {
            params.set('encrypt-method', node.params.method);
        }
        if (node.params?.tls === 'tls' || node.params?.tls === true) {
            params.set('tls', 'true');
        }
        if (node.params?.net === 'ws') {
            params.set('ws', 'true');
            if (node.params.host) {
                params.set('ws-headers', `Host:${node.params.host}`);
            }
        }
        const paramString = Array.from(params.entries()).map(([key, value]) => `${key}=${value}`).join(', ');
        let line = `${node.name} = ${node.type}, ${node.server}, ${node.port}`;
        if (paramString) {
            line += `, ${paramString}`;
        }
        return line;
    });
    const proxyGroups = getSurgeProxyGroups(nodes);
    const content = `\n[Proxy]\n${proxyLines.join('\n')}\n\n[Proxy Group]\n${proxyGroups.join('\n')}\n\n[Rule]\n${surgeRules.join('\n')}\n    `.trim();
    return new Response(content, { 
        headers: { 
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="prosub_surge.conf"`
        } 
    });
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
                const tls = (node.params?.tls === 'tls' || node.params?.tls === true) ? ', obfs=wss' : '';
                line = `vmess=${node.server}:${node.port}, method=aes-128-gcm, password=${node.password}, obfs=ws, obfs-uri=${node.params?.path}, obfs-header="Host: ${node.params?.host}[Rr][Nn]User-Agent: okhttp/3.12.1"${tls}, ${remark}`;
                break;
            case 'trojan':
                line = `trojan=${node.server}:${node.port}, password=${node.password}, ${remark}`;
                break;
        }
        return line ? `${line}, ${tag}` : '';
    }).filter(Boolean);
    const policies = getQuantumultXPolicies(nodes);
    const content = `\n[server_local]\n${serverLines.join('\n')}\n\n[filter_remote]\n${quantumultXRules.join('\n')}\n\n[policy]\n${policies.join('\n')}\n    `.trim();
    return new Response(content, { 
        headers: { 
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="prosub_quantumultx.conf"`
        } 
    });
}

function generateLoonSubscription(nodes: Node[]): Response {
    const proxyLines = nodes.map(node => {
        let line = `${node.name} = ${node.type}, ${node.server}, ${node.port}, password=${node.password}`;
        if (node.type === 'ss') {
            line += `, method=${node.params?.method}`;
        }
        if (node.params?.tls === 'tls' || node.params?.tls === true) {
            line += ', tls=true';
        }
        if (node.params?.net === 'ws') {
            line += ', transport=ws';
            if (node.params.host) {
                line += `, ws-header=Host:${node.params.host}`; 
            }
        }
        return line;
    });
    const proxyGroups = getLoonProxyGroups(nodes);
    const content = `\n[Proxy]\n${proxyLines.join('\n')}\n\n[Proxy Group]\n${proxyGroups.join('\n')}\n\n[Rule]\n${loonRules.join('\n')}\n    `.trim();
    return new Response(content, { 
        headers: { 
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="prosub_loon.conf"`
        } 
    });
}

function generateSingBoxSubscription(nodes: Node[]): Response {
    const outbounds = getSingBoxOutbounds(nodes);
    const route = getSingBoxRoute();
    const singboxConfig = {
        log: { level: 'info', timestamp: true },
        dns: {
            servers: [
                { address: 'https://223.5.5.5/dns-query', detour: 'DIRECT' },
                { address: 'https://1.1.1.1/dns-query', detour: '🚀 节点选择' },
            ],
            strategy: 'ipv4_only',
        },
        inbounds: [
            { type: 'tun', interface_name: 'tun0', inet4_address: '172.19.0.1/30', mtu: 1500, auto_route: true, strict_route: true },
            { type: 'mixed', listen: '0.0.0.0', listen_port: 7890 },
        ],
        outbounds: outbounds,
        route: route,
    };
    const jsonString = JSON.stringify(singboxConfig, null, 2);
    return new Response(jsonString, { 
        headers: { 
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Disposition': `attachment; filename="prosub_singbox.json"`
        } 
    });
}


// --- Main Handler ---
export async function generateSubscriptionResponse(request: NextRequest, profile: Profile): Promise<Response> {
    const allNodes = await fetchAllNodes(profile);
    
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

// --- Data Fetching Logic ---
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

async function fetchAllNodes(profile: Profile): Promise<Node[]> {
    // @ts-ignore
    const KV = process.env.KV as KVNamespace;
    const nodeIds = profile.nodes || [];
    const subIds = profile.subscriptions || [];

    const nodesJson = await Promise.all(nodeIds.map(id => KV.get(`node:${id}`)));
    const manualNodes = nodesJson.filter(Boolean).map(json => JSON.parse(json as string));

    const subsJson = await Promise.all(subIds.map(id => KV.get(`subscription:${id}`)));
    const subscriptions = subsJson.filter(Boolean).map(json => JSON.parse(json as string));

    const subLinksPromises = subscriptions.map(sub => fetchNodesFromSubscription(sub.url));
    const subLinksArrays = await Promise.all(subLinksPromises);
    const allSubLinks = subLinksArrays.flat();
    const parsedSubNodes = allSubLinks.map(link => parseNodeLink(link)).filter(Boolean) as Node[];

    return [...manualNodes, ...parsedSubNodes];
}