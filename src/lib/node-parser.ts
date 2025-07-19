// src/lib/node-parser.ts

import { v4 as uuidv4 } from 'uuid';
import { Node } from '@/types';

// 非常基础的 Base64 解码函数 (适用于 Edge Runtime)
function base64Decode(str: string): string {
    try {
        return atob(str);
    } catch (e) {
        // 尝试处理 URL安全的 Base64
        try {
            return atob(str.replace(/_/g, '/').replace(/-/g, '+'));
        } catch (e2) {
            console.error('Failed to decode base64 string:', str);
            return '';
        }
    }
}

export function parseNodeLink(link: string): Partial<Node> | null {
    link = link.trim();
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
                    net: config.net,
                    tls: config.tls,
                    aid: config.aid,
                    host: config.host,
                    path: config.path,
                },
            };
        } catch (e) {
            console.error('Failed to parse VMess link:', e);
            return null;
        }
    }

    if (link.startsWith('vless://') || link.startsWith('trojan://')) {
        try {
            const url = new URL(link);
            const params: Record<string, any> = {};
            url.searchParams.forEach((value, key) => {
                params[key] = value;
            });
            return {
                name: url.hash ? decodeURIComponent(url.hash.substring(1)) : `${url.hostname}:${url.port}`,
                server: url.hostname,
                port: parseInt(url.port, 10),
                password: url.username,
                type: link.startsWith('vless') ? 'vless' : 'trojan',
                params: params,
            };
        } catch (e) {
            console.error('Failed to parse VLESS/Trojan link:', e);
            return null;
        }
    }
    
    if (link.startsWith('ss://')) {
        try {
            const url = new URL(link);
            const decodedPart = base64Decode(url.hostname);
            const [method, password] = decodedPart.split(':');
            const name = url.hash ? decodeURIComponent(url.hash.substring(1)) : `${url.pathname.substring(2)}:${url.port}`;

            return {
                name: name,
                server: url.pathname.substring(2),
                port: parseInt(url.port, 10),
                password: password,
                type: 'ss',
                params: { method: method },
            };
        } catch (e) {
             // 尝试另一种常见的 SS 格式: ss://<base64>@<server>:<port>#<name>
            try {
                const atIndex = link.indexOf('@');
                const hashIndex = link.indexOf('#');
                const name = decodeURIComponent(link.substring(hashIndex + 1));
                const serverInfo = link.substring(atIndex + 1, hashIndex);
                const [server, port] = serverInfo.split(':');
                const credentialsBase64 = link.substring(5, atIndex);
                const credentials = base64Decode(credentialsBase64);
                const [method, password] = credentials.split(':');
                
                return {
                    name: name || `${server}:${port}`,
                    server: server,
                    port: parseInt(port, 10),
                    password: password,
                    type: 'ss',
                    params: { method: method },
                };

            } catch (e2) {
                console.error('Failed to parse SS link:', e2);
                return null;
            }
        }
    }

    return null;
}