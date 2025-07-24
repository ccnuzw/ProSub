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
            return {
                name: config.ps || `${config.add}:${config.port}`,
                server: config.add,
                port: parseInt(config.port, 10),
                password: config.id, // In VMess, UUID is the password
                type: 'vmess',
                params: {
                    net: config.net, tls: config.tls, aid: config.aid,
                    host: config.host, path: config.path, type: config.type, security: 'auto'
                },
            };
        } catch (e) {
            console.error('解析 VMess 链接失败:', link, e);
            return null;
        }
    }
    
    try {
        const url = new URL(link);
        const protocol = url.protocol.replace(':', '');
        const supportedUrlProtocols = ['vless', 'trojan', 'vmess', 'socks', 'tuic', 'hysteria', 'hysteria2', 'anytls'];
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
        // Not a standard URL
    }

    console.warn(`不支持或格式错误的链接，已跳过: ${link}`);
    return null;
}