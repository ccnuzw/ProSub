import { Node } from './types';

function base64Decode(str: string): string {
    try {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
        console.error('Base64 解码失败:', str, e);
        return '';
    }
}

export function parseNodeLink(link: string): Partial<Node> | null {
    link = link.trim();

    // *** FIX STARTS HERE: Added SSR Parser ***
    if (link.startsWith('ssr://')) {
        try {
            const decoded = base64Decode(link.substring(6));
            const mainParts = decoded.split('/?');
            const mainInfo = mainParts[0];
            const paramsStr = mainParts.length > 1 ? mainParts[1] : '';

            // SSR's main info is in the format: server:port:protocol:method:obfs:password_base64
            // This is tricky with IPv6. We split from the right side.
            const parts = mainInfo.split(':');
            if (parts.length < 6) throw new Error("无效的 SSR 格式: 字段不足");

            const password_base64 = parts.pop()!;
            const obfs = parts.pop()!;
            const method = parts.pop()!;
            const protocol = parts.pop()!;
            const port = parseInt(parts.pop()!, 10);
            const server = parts.join(':'); // The rest is the server address (handles IPv6)
            
            const password = base64Decode(password_base64);

            const params: Record<string, any> = {};
            if (paramsStr) {
                const searchParams = new URLSearchParams(paramsStr);
                searchParams.forEach((value, key) => {
                    // SSR remarks and other params are also base64 encoded
                    params[key] = base64Decode(value);
                });
            }

            return {
                name: params.remarks || `${server}:${port}`,
                server,
                port,
                password,
                type: 'ssr',
                params: {
                    protocol,
                    method,
                    obfs,
                    obfsparam: params.obfsparam,
                    protoparam: params.protoparam,
                },
            };
        } catch (e) {
            console.error('解析 SSR 链接失败:', link, e);
            return null;
        }
    }
    // *** FIX ENDS HERE ***

    if (link.startsWith('vmess://')) {
        try {
            const jsonStr = base64Decode(link.substring(8));
            const config = JSON.parse(jsonStr);
            return {
                name: config.ps || `${config.add}:${config.port}`,
                server: config.add,
                port: parseInt(config.port, 10),
                password: config.id,
                type: 'vmess',
                params: {
                    net: config.net, tls: config.tls, aid: config.aid,
                    host: config.host, path: config.path, type: config.type,
                },
            };
        } catch (e) {
            console.error('解析 VMess 链接失败:', link, e);
            return null;
        }
    }

    if (link.startsWith('ss://')) {
        try {
            const hashIndex = link.lastIndexOf('#');
            const name = hashIndex !== -1 ? decodeURIComponent(link.substring(hashIndex + 1)) : '';
            const coreUrl = (hashIndex !== -1 ? link.substring(0, hashIndex) : link).substring(5);
            const atIndex = coreUrl.lastIndexOf('@');
            if (atIndex === -1) throw new Error("无效的 SS 格式: 缺少 '@'");
            const credentialsBase64 = coreUrl.substring(0, atIndex);
            const credentials = base64Decode(credentialsBase64);
            const [method, password] = credentials.split(':');
            const serverInfo = coreUrl.substring(atIndex + 1);
            let server: string, port: number;
            const ipv6Match = serverInfo.match(/^\[(.+)\]:(\d+)$/);
            if (ipv6Match) {
                server = ipv6Match[1];
                port = parseInt(ipv6Match[2], 10);
            } else {
                const lastColonIndex = serverInfo.lastIndexOf(':');
                if (lastColonIndex === -1) throw new Error("无效的 SS 格式: 找不到端口");
                server = serverInfo.substring(0, lastColonIndex);
                port = parseInt(serverInfo.substring(lastColonIndex + 1), 10);
            }
            return {
                name: name || `${server}:${port}`, server, port, password,
                type: 'ss', params: { method },
            };
        } catch (e) {
            console.error('解析 SS 链接失败:', link, e);
            return null;
        }
    }

    try {
        const url = new URL(link);
        const protocol = url.protocol.replace(':', '');
        const supportedUrlProtocols = ['vless', 'trojan', 'socks', 'tuic', 'hysteria', 'hysteria2', 'anytls'];
        if (supportedUrlProtocols.includes(protocol)) {
            const params: Record<string, any> = {};
            url.searchParams.forEach((value, key) => { params[key] = value; });
            let nodeType = protocol as Node['type'];
            if (protocol === 'vless' && params.security === 'reality') {
                nodeType = 'vless-reality';
            }
            return {
                name: url.hash ? decodeURIComponent(url.hash.substring(1)) : `${url.hostname}:${url.port}`,
                server: url.hostname, port: parseInt(url.port, 10),
                password: url.username ? decodeURIComponent(url.username) : url.password ? decodeURIComponent(url.password) : undefined,
                type: nodeType, params: params,
            };
        }
    } catch (e) {
        // Not a standard URL.
    }

    console.warn(`不支持或格式错误的链接，已跳过: ${link}`);
    return null;
}