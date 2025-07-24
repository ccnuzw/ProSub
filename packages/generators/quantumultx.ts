import { Node, RuleSetConfig } from '../types';
import * as ruleSets from '../rulesets';

async function fetchRemoteRules(url: string): Promise<any> {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        return await response.text();
    } catch (e) {
        return null;
    }
}

export async function generateQuantumultXSubscription(nodes: Node[], ruleConfig?: RuleSetConfig): Promise<Response> {
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

    let remoteRules: any = {};
    if (ruleConfig?.type === 'remote' && ruleConfig.url) {
        const fetchedRules = await fetchRemoteRules(ruleConfig.url);
        remoteRules = fetchedRules || ruleSets.getQuantumultXDefaultRules(nodes);
    } else if (ruleConfig?.id === 'lite') {
        remoteRules = ruleSets.getQuantumultXLiteRules(nodes);
    } else {
        remoteRules = ruleSets.getQuantumultXDefaultRules(nodes);
    }

    const content = `[server_local]\n${serverLines.join('\n')}\n\n[filter_remote]\n${(remoteRules['filter_remote'] || []).join('\n')}\n\n[policy]\n${(remoteRules['policy'] || []).join('\n')}`;
    return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}