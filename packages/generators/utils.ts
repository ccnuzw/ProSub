import { Node } from '../types';

// Helper to encode base64 in a URL-safe way
export function base64Encode(str: string): string {
    return btoa(unescape(encodeURIComponent(str)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

export function convertNodeToUri(node: Node): string {
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
                const serverAddress = node.server.includes(':') ? `[${node.server}]` : node.server;
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
                const protocol = node.type === 'vless-reality' ? 'vless' : node.type;
                const url = new URL(`${protocol}://${node.password || ''}@${node.server}:${node.port}`);
                url.hash = encodedName;
                if (node.params) {
                    for (const key in node.params) {
                        url.searchParams.set(key, String(node.params[key]));
                    }
                }
                return url.toString();
        }
    } catch (e) {
        console.error(`转换节点到 URI 失败: ${node.name}`, e);
        return '';
    }
}