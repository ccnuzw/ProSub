import { Node } from './types';

const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    } else {
        // Fallback for environments where crypto.randomUUID is not available
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};

function base64Decode(str: string): string | null {
  try {
    const base64 = str.replace(/_/g, '/').replace(/-/g, '+');
    const padded = base64.length % 4 === 0 ? base64 : base64 + '='.repeat(4 - (base64.length % 4));
    const binaryString = atob(padded);
    return new TextDecoder('utf-8').decode(Uint8Array.from(binaryString, char => char.charCodeAt(0)));
  } catch (e: any) {
    console.warn(`Base64 decoding failed for: ${str.substring(0, Math.min(str.length, 50))}... Error: ${e.message}`);
    return null;
  }
}

function parseShadowsocksLink(link: string): Partial<Node> | null {
    try {
        const hashIndex = link.lastIndexOf('#');
        const name = hashIndex !== -1 ? decodeURIComponent(link.substring(hashIndex + 1)) : '';
        const coreUrl = link.substring(5, hashIndex !== -1 ? hashIndex : link.length); // Part after ss:// and before #

        const atIndex = coreUrl.lastIndexOf('@');
        if (atIndex === -1) throw new Error("无效的 SS 格式: 缺少 '@'");

        const credentialsPartEncoded = coreUrl.substring(0, atIndex);
        const serverInfoPartEncoded = coreUrl.substring(atIndex + 1);

        let method, password;

        // Try to decode credentials part. It might be plain or base64 encoded.
        const credentialsPart = decodeURIComponent(credentialsPartEncoded); // First, URL-decode

        let credentialsDecoded: string;
        try {
            // Then, try Base64 decode. If it fails, use the URL-decoded string directly.
            credentialsDecoded = base64Decode(credentialsPart) || credentialsPart;
        } catch (e) {
            credentialsDecoded = credentialsPart; // Fallback to URL-decoded if Base64 fails
        }

        const colonIndex = credentialsDecoded.indexOf(':');
        if (colonIndex === -1) {
            method = 'aes-256-gcm'; // Default method if not specified
            password = credentialsDecoded;
        } else {
            method = credentialsDecoded.substring(0, colonIndex);
            password = credentialsDecoded.substring(colonIndex + 1);
        }

        if (!password) {
            throw new Error("无效的 SS 格式: 密码为空");
        }

        let server: string, port: number;
        const serverInfoDecoded = decodeURIComponent(serverInfoPartEncoded);

        const ipv6Match = serverInfoDecoded.match(/^\[(.+)\]:(\d+)$/);
        if (ipv6Match) {
            server = ipv6Match[1];
            port = parseInt(ipv6Match[2], 10);
        } else {
            const lastColonIndex = serverInfoDecoded.lastIndexOf(':');
            if (lastColonIndex === -1) throw new Error("无效的 SS 格式: 找不到端口");
            server = serverInfoDecoded.substring(0, lastColonIndex);
            port = parseInt(serverInfoDecoded.substring(lastColonIndex + 1), 10);
        }

        return {
            id: generateUUID(),
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

export function parseNodeLink(link: string): Partial<Node> | null {
    link = link.trim();

    if (link.startsWith('ss://')) {
        return parseShadowsocksLink(link);
    }

    if (link.startsWith('vmess://')) {
        try {
            const jsonStr = base64Decode(decodeURIComponent(link.substring(8)));
            if (jsonStr === null) throw new Error("VMess Base64 解码失败");
            const config = JSON.parse(jsonStr);
            
            // 验证必要字段
            if (!config.add || !config.port || !config.id) {
                throw new Error("VMess 配置缺少必要字段");
            }
            
            return {
                id: generateUUID(),
                name: config.ps || `${config.add}:${config.port}`,
                server: config.add,
                port: parseInt(config.port, 10),
                password: config.id, // In VMess, UUID is the password
                type: 'vmess',
                params: {
                    net: config.net || 'tcp', 
                    tls: config.tls || 'none', 
                    aid: config.aid || 0,
                    host: config.host || '', 
                    path: config.path || '', 
                    type: config.type || 'none', 
                    security: config.security || 'auto'
                },
            };
        } catch (e) {
            console.error('解析 VMess 链接失败:', link, e);
            return null;
        }
    }

    if (link.startsWith('vless://')) {
        try {
            const url = new URL(link);
            const params: Record<string, any> = {};
            url.searchParams.forEach((value, key) => { params[key] = value; });
            
            let nodeType = 'vless' as Node['type'];
            if (params.security === 'reality') {
                nodeType = 'vless-reality';
            }
            
            // 确保hostname和port存在
            if (!url.hostname || !url.port) {
                throw new Error("VLESS 链接缺少服务器地址或端口");
            }
            
            // 处理用户名（UUID）
            const username = url.username ? decodeURIComponent(url.username) : '';
            const password = url.password ? decodeURIComponent(url.password) : '';
            
            // 对于VLESS，用户名通常是UUID，作为密码使用
            const finalPassword = username || password;
            
            return {
                id: generateUUID(),
                name: url.hash ? decodeURIComponent(url.hash.substring(1)) : `${url.hostname}:${url.port}`,
                server: url.hostname, 
                port: parseInt(url.port, 10),
                password: finalPassword,
                type: nodeType, 
                params: params,
            };
        } catch (e) {
            console.error('解析 VLess 链接失败:', link, e);
            return null;
        }
    }

    if (link.startsWith('trojan://')) {
        try {
            const url = new URL(link);
            const params: Record<string, any> = {};
            url.searchParams.forEach((value, key) => { params[key] = value; });
            
            return {
                id: generateUUID(),
                name: url.hash ? decodeURIComponent(url.hash.substring(1)) : `${url.hostname}:${url.port}`,
                server: url.hostname, 
                port: parseInt(url.port, 10),
                password: url.username ? decodeURIComponent(url.username) : url.password ? decodeURIComponent(url.password) : '',
                type: 'trojan', 
                params: params,
            };
        } catch (e) {
            console.error('解析 Trojan 链接失败:', link, e);
            return null;
        }
    }

    if (link.startsWith('ssr://')) {
        try {
            const base64Part = link.substring(6);
            const decoded = base64Decode(decodeURIComponent(base64Part));
            if (decoded === null) throw new Error("SSR Base64 解码失败");
            const atIndex = decoded.lastIndexOf('@');
            if (atIndex === -1) throw new Error("无效的 SSR 格式");
            
            const serverPart = decoded.substring(atIndex + 1);
            const colonIndex = serverPart.lastIndexOf(':');
            if (colonIndex === -1) throw new Error("无效的 SSR 格式: 找不到端口");
            
            const server = serverPart.substring(0, colonIndex);
            const port = parseInt(serverPart.substring(colonIndex + 1), 10);
            
            return {
                id: generateUUID(),
                name: `${server}:${port}`,
                server, 
                port,
                password: '', // SSR 密码在加密部分
                type: 'ssr', 
                params: {},
            };
        } catch (e) {
            console.error('解析 SSR 链接失败:', link, e);
            return null;
        }
    }
    
    // 尝试解析其他 URL 格式
    try {
        const url = new URL(link);
        const protocol = url.protocol.replace(':', '');
        const supportedUrlProtocols = ['socks', 'tuic', 'hysteria', 'hysteria2', 'anytls'];
        if (supportedUrlProtocols.includes(protocol)) {
            const params: Record<string, any> = {};
            url.searchParams.forEach((value, key) => { params[key] = value; });
            
            return {
                id: generateUUID(),
                name: url.hash ? decodeURIComponent(url.hash.substring(1)) : `${url.hostname}:${url.port}`,
                server: url.hostname, 
                port: parseInt(url.port, 10),
                password: url.username ? decodeURIComponent(url.username) : url.password ? decodeURIComponent(url.password) : '',
                type: protocol as Node['type'], 
                params: params,
            };
        }
    } catch (e) {
        // Not a standard URL
    }

    // 尝试解析纯文本格式 (server:port:password)
    try {
        const parts = link.split(':');
        if (parts.length >= 2) {
            const server = parts[0];
            const port = parseInt(parts[1], 10);
            const password = parts[2] || '';
            
            if (server && port && !isNaN(port)) {
                return {
                    id: generateUUID(),
                    name: `${server}:${port}`,
                    server,
                    port,
                    password,
                    type: 'vmess', // 默认类型
                    params: {},
                };
            }
        }
    } catch (e) {
        // Not a valid text format
    }

    console.warn(`不支持或格式错误的链接，已跳过: ${link}`);
    return null;
}