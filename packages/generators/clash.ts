import { Node, RuleSetConfig } from '../types';
import * as yaml from 'js-yaml';
import * as ruleSets from '../rulesets';

async function fetchRemoteRules(url: string): Promise<any> {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const text = await response.text();
        try { return yaml.load(text); } catch (e) { return text; }
    } catch (e) {
        return null;
    }
}

export async function generateClashSubscription(nodes: Node[], ruleConfig?: RuleSetConfig): Promise<Response> {
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
                const cipher = node.params?.cipher || node.params?.method;
                const password = node.password || node.params?.password;
                if (!cipher || !password) {
                    console.warn(`跳过无效的 SS 节点 (缺少 cipher 或 password): ${node.name}`);
                    return null;
                }
                proxy.password = password;
                proxy.cipher = cipher;
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
                proxy.tls = !!(node.params?.tls === true || node.params?.tls === 'tls' || node.params?.security === 'tls');
                proxy.network = network;
                if (proxy.network === 'ws') {
                    proxy['ws-opts'] = {
                        path: node.params?.['ws-path'] || node.params?.path || '/',
                        headers: node.params?.['ws-headers'] || { Host: node.params?.host || node.server },
                    };
                }
                if(proxy.tls) {
                    proxy.servername = node.params?.servername || node.params?.host || node.params?.sni || node.server;
                }
                break;
            case 'vless':
            case 'vless-reality':
                proxy.type = 'vless';
                proxy.uuid = node.password || node.params?.uuid;
                proxy.tls = !!(node.params?.tls === true || node.params?.tls === 'tls' || node.params?.security === 'tls');
                proxy.network = network;
                proxy.flow = node.params?.flow;
                 if (proxy.network === 'ws') {
                    proxy['ws-opts'] = {
                        path: node.params?.['ws-path'] || node.params?.path || '/',
                        headers: node.params?.['ws-headers'] || { Host: node.params?.host || node.server },
                    };
                }
                if (node.type === 'vless-reality' || node.params?.security === 'reality') {
                    proxy.tls = true;
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
                proxy.sni = node.params?.sni || node.params?.host || node.server;
                proxy.tls = true;
                proxy['skip-cert-verify'] = node.params?.['skip-cert-verify'] ?? (node.params?.allowInsecure === '1' || node.params?.allowInsecure === true);
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
        return proxy;
    }).filter(p => p !== null);
    
    let ruleset;
    if (ruleConfig?.type === 'remote' && ruleConfig.url) {
        ruleset = await fetchRemoteRules(ruleConfig.url) || ruleSets.getClashDefaultRules(nodes);
    } else if (ruleConfig?.id === 'lite') {
        ruleset = ruleSets.getClashLiteRules(nodes);
    } else {
        ruleset = ruleSets.getClashDefaultRules(nodes);
    }
    
    const finalConfig = {
        'port': 7890,
        'socks-port': 7891,
        'allow-lan': true,
        'mode': 'rule',
        'log-level': 'info',
        'external-controller': '127.0.0.1:9090',
        'proxies': proxies,
        ...ruleset,
    };
    
    try {
        const yamlString = yaml.dump(finalConfig, { sortKeys: false, lineWidth: -1 });
        return new Response(yamlString, {
            headers: { 'Content-Type': 'text/yaml; charset=utf-8', 'Content-Disposition': `attachment; filename="prosub_clash.yaml"` }
        });
    } catch (error) {
        console.error("YAML DUMP FAILED:", error);
        return new Response(`Server error: Failed to generate YAML configuration. ${error.message}`, { status: 500 });
    }
}