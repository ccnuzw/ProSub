import { Node } from './types';

function base64Decode(str: string): string {
  const uriDecodedStr = decodeURIComponent(str);
  const base64 = uriDecodedStr.replace(/_/g, '/').replace(/-/g, '+');
  const padded = base64.length % 4 === 0 ? base64 : base64 + '='.repeat(4 - (base64.length % 4));
  const binaryString = atob(padded);
  try {
    return decodeURIComponent(escape(binaryString));
  } catch (e) {
    return binaryString;
  }
}

export function parseNodeLink(link: string): Partial<Node> | null {
    link = link.trim();

    if (link.startsWith('ss://')) {
        try {
            const hashIndex = link.lastIndexOf('#');
            const name = hashIndex !== -1 ? decodeURIComponent(link.substring(hashIndex + 1)) : '';
            const coreUrl = (hashIndex !== -1 ? link.substring(0, hashIndex) : link).substring(5);
            
            const atIndex = coreUrl.lastIndexOf('@');
            if (atIndex === -1) throw new Error("无效的 SS 格式: 缺少 '@'");

            const credentialsBase64 = coreUrl.substring(0, atIndex);
            const credentials = base64Decode(credentialsBase64);
            const colonIndex = credentials.indexOf(':');

            let method, password;
            
            if (colonIndex === -1) {
                // 如果没有冒号，则整个部分都是密码，cipher 使用一个安全的默认值
                method = 'aes-256-gcm'; 
                password = credentials;
            } else {
                method = credentials.substring(0, colonIndex);
                password = credentials.substring(colonIndex + 1);
            }
            
            if (!password) {
                 throw new Error("无效的 SS 格式: 密码为空");
            }

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

    if (link.startsWith('vmess://')) {
        try {
            const jsonStr = base64Decode(link.substring(8));
            const config = JSON.parse(jsonStr);
            
            // 验证必要字段
            if (!config.add || !config.port || !config.id) {
                throw new Error("VMess 配置缺少必要字段");
            }
            
            return {
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
            const decoded = base64Decode(base64Part);
            const atIndex = decoded.lastIndexOf('@');
            if (atIndex === -1) throw new Error("无效的 SSR 格式");
            
            const serverPart = decoded.substring(atIndex + 1);
            const colonIndex = serverPart.lastIndexOf(':');
            if (colonIndex === -1) throw new Error("无效的 SSR 格式: 找不到端口");
            
            const server = serverPart.substring(0, colonIndex);
            const port = parseInt(serverPart.substring(colonIndex + 1), 10);
            
            return {
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