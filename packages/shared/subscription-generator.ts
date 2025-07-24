import { Profile, Node, Env, Subscription, SubscriptionRule, RuleSetConfig } from './types';
import { parseClashYaml } from './clash-parser';
import { parseNodeLink } from './node-parser';
import {
    generateClashSubscription,
    generateLoonSubscription,
    generateQuantumultXSubscription,
    generateSingBoxSubscription,
    generateSurgeSubscription,
    convertNodeToUri
} from './generators/index';

function generateBase64Subscription(nodes: Node[]): Response {
    const nodeLinks = nodes.map(convertNodeToUri).filter(Boolean);
    if (nodeLinks.length === 0) return new Response('', { status: 200 });
    const combinedContent = nodeLinks.join('\n');
    const base64Content = btoa(combinedContent);
    return new Response(base64Content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

async function fetchNodesFromSubscription(url: string): Promise<Node[]> {
    try {
        const response = await fetch(url, { headers: { 'User-Agent': 'ProSub/1.0' } });
        if (!response.ok) { return []; }
        const content = await response.text();
        let nodes: Node[] = parseClashYaml(content);
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
        includeRules.some(rule => new RegExp(rule.pattern, 'i').test(node.name))
        );
    }
    if (excludeRules.length > 0) {
        filteredNodes = filteredNodes.filter(node => 
        !excludeRules.some(rule => new RegExp(rule.pattern, 'i').test(node.name))
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
        const subId = typeof profileSub === 'string' ? profileSub : profileSub.id;
        const rules = typeof profileSub === 'string' ? [] : profileSub.rules;
        const subscription = allSubscriptions[subId];
        if (subscription) {
            let nodesFromSub = await fetchNodesFromSubscription(subscription.url);
            return applySubscriptionRules(nodesFromSub, rules);
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


export async function generateSubscriptionResponse(request: Request, profile: Profile, env: Env): Promise<Response> {
    try {
        const allNodes = await fetchAllNodes(profile, env);
        const url = new URL(request.url);
        const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
        let targetClient = url.searchParams.get('target')?.toLowerCase();
        
        if (url.searchParams.has('clash')) targetClient = 'clash';
        else if (url.searchParams.has('surge')) targetClient = 'surge';
        else if (url.searchParams.has('quantumultx')) targetClient = 'quantumultx';
        else if (url.searchParams.has('loon')) targetClient = 'loon';
        else if (url.searchParams.has('sing-box')) targetClient = 'sing-box';
        else if (url.searchParams.has('base64')) targetClient = 'base64';

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