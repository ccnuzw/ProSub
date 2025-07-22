import { Node } from './types'; // 确保这是正确的相对路径

// 增强的 Base64 解码函数
function base64Decode(str: string): string {
    try {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }
        const decodedUriComponent = decodeURIComponent(base64);
        const binaryString = atob(decodedUriComponent);
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

// 最终、最健壮的节点链接解析器
export function parseNodeLink(link: string): Partial<Node> | null {
    link = link.trim();

    // 1. Vmess (JSON-based)
    if (link.startsWith('vmess://')) {
        try {
            const jsonStr = base64Decode(link.substring(8));
            const config = JSON.parse(jsonStr);
            return {
                name: config.ps || `${config.add}:${config.port}`,
                server: config.add,
                port: parseInt(config.port, 10),
                password: config.id, // a.k.a UUID
                type: 'vmess',
                params: {
                    net: config.net,
                    tls: config.tls,
                    aid: config.aid,
                    host: config.host,
                    path: config.path,
                    type: config.type,
                },
            };
        } catch (e) {
            console.error('解析 VMess 链接失败:', link, e);
            return null;
        }
    }

    // 2. Shadowsocks (SS)
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
                name: name || `${server}:${port}`,
                server,
                port,
                password,
                type: 'ss',
                params: { method },
            };
        } catch (e) {
            console.error('解析 SS 链接失败:', link, e);
            return null;
        }
    }

    // 3. 通用的 URL 格式解析器 (VLESS, Trojan, anyTLS, etc.)
    try {
        const url = new URL(link);
        const protocol = url.protocol.replace(':', '');
        
        // *** FIX IS HERE ***
        const supportedUrlProtocols = ['vless', 'trojan', 'socks', 'tuic', 'hysteria', 'hysteria2', 'anytls'];
        if (supportedUrlProtocols.includes(protocol)) {
            const params: Record<string, any> = {};
            url.searchParams.forEach((value, key) => {
                params[key] = value;
            });

            let nodeType = protocol as Node['type'];
            if (protocol === 'vless' && params.security === 'reality') {
                nodeType = 'vless-reality';
            }

            return {
                name: url.hash ? decodeURIComponent(url.hash.substring(1)) : `${url.hostname}:${url.port}`,
                server: url.hostname,
                port: parseInt(url.port, 10),
                password: url.username ? decodeURIComponent(url.username) : url.password ? decodeURIComponent(url.password) : undefined,
                type: nodeType,
                params: params,
            };
        }
    } catch (e) {
        // Not a standard URL, which is fine.
    }

    console.warn(`不支持或格式错误的链接，已跳过: ${link}`);
    return null;
}