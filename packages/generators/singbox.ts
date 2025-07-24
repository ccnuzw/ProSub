import { Node, RuleSetConfig } from '../types';
import * as ruleSets from '../rulesets';
import * as yaml from 'js-yaml';


async function fetchRemoteRules(url: string): Promise<any> {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const text = await response.text();
        try { return JSON.parse(text); } catch (e) { return null; }
    } catch (e) {
        return null;
    }
}

export async function generateSingBoxSubscription(nodes: Node[], ruleConfig?: RuleSetConfig): Promise<Response> {
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
                headers: { Host: node.params.host || node.server },
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

    let remoteRules: any = {};
    if (ruleConfig?.type === 'remote' && ruleConfig.url) {
        const fetchedRules = await fetchRemoteRules(ruleConfig.url);
        remoteRules = fetchedRules || ruleSets.getSingBoxDefaultRules(nodes);
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
        outbounds: [...nodeOutbounds, ...(remoteRules.outbounds || [])],
        route: remoteRules.route,
    };
    return new Response(JSON.stringify(singboxConfig, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}