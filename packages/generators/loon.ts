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

export async function generateLoonSubscription(nodes: Node[], ruleConfig?: RuleSetConfig): Promise<Response> {
    const proxyLines = nodes.map(node => `${node.name} = ${node.type}, ${node.server}, ${node.port}, password=${node.password}`);

    let remoteRules: any = {};
    if (ruleConfig?.type === 'remote' && ruleConfig.url) {
        const fetchedRules = await fetchRemoteRules(ruleConfig.url);
        remoteRules = fetchedRules || ruleSets.getLoonDefaultRules(nodes);
    } else if (ruleConfig?.id === 'lite') {
        remoteRules = ruleSets.getLoonLiteRules(nodes);
    } else {
        remoteRules = ruleSets.getLoonDefaultRules(nodes);
    }

    const content = `[Proxy]\n${proxyLines.join('\n')}\n\n[Proxy Group]\n${(remoteRules['proxy-groups'] || []).join('\n')}\n\n[Rule]\n${(remoteRules['rules'] || []).join('\n')}`;
    return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}