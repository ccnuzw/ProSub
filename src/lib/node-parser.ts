// src/lib/node-parser.ts

import { Node } from '@/types';
import { Buffer } from 'buffer'; // 导入 Buffer 以便在 Edge 环境中使用

// *** 这是关键的修复：使用 Buffer 来进行健壮的 Base64 解码 ***
function base64Decode(str: string): string {
    try {
        // 替换 URL 安全字符，并使用 Buffer 进行解码，确保 UTF-8 兼容性
        const normalizedStr = str.replace(/_/g, '/').replace(/-/g, '+');
        return Buffer.from(normalizedStr, 'base64').toString('utf8');
    } catch (e) {
        console.error('Failed to decode base64 string:', str, e);
        return '';
    }
}

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
                    type: config.type, // header type for http
                },
            };
        } catch (e) {
            console.error('Failed to parse VMess link:', e);
            return null;
        }
    }

    // 2. Shadowsocks (SS) - 兼容 IPv6
    if (link.startsWith('ss://')) {
        try {
            const atIndex = link.indexOf('@');
            const hashIndex = link.lastIndexOf('#');
            if (atIndex === -1 || hashIndex === -1) throw new Error("Invalid SS link format");

            const name = decodeURIComponent(link.substring(hashIndex + 1));
            const serverInfo = link.substring(atIndex + 1, hashIndex);
            
            const lastColonIndex = serverInfo.lastIndexOf(':');
            if (lastColonIndex === -1) throw new Error("Port not found in SS link");
            
            let server = serverInfo.substring(0, lastColonIndex);
            const port = parseInt(serverInfo.substring(lastColonIndex + 1), 10);
            
            if (server.startsWith('[') && server.endsWith(']')) {
                server = server.substring(1, server.length - 1);
            }

            const credentialsBase64 = link.substring(5, atIndex);
            const credentials = base64Decode(credentialsBase64);
            const [method, password] = credentials.split(':');
            
            return {
                name: name || `${server}:${port}`,
                server,
                port,
                password,
                type: 'ss',
                params: { method },
            };
        } catch (e) {
            console.error('Failed to parse SS link:', e);
            return null;
        }
    }

    // 3. ShadowsocksR (SSR) - 格式非常特殊
    if (link.startsWith('ssr://')) {
        try {
            const decoded = base64Decode(link.substring(6));
            const mainParts = decoded.split('/?');
            const [server, port, protocol, method, obfs, passwordBase64] = mainParts[0].split(':');
            
            const password = base64Decode(passwordBase64);
            const params: Record<string, any> = {};
            if (mainParts[1]) {
                const searchParams = new URLSearchParams(mainParts[1]);
                searchParams.forEach((value, key) => {
                    if (key === 'remarks') {
                        params[key] = base64Decode(value);
                    } else {
                        params[key] = value;
                    }
                });
            }

            return {
                name: params.remarks || `${server}:${port}`,
                server,
                port: parseInt(port, 10),
                password,
                type: 'ssr',
                params: {
                    protocol,
                    method,
                    obfs,
                    obfsparam: params.obfsparam ? base64Decode(params.obfsparam) : undefined,
                    protoparam: params.protoparam ? base64Decode(params.protoparam) : undefined,
                },
            };
        } catch (e) {
            console.error('Failed to parse SSR link:', e);
            return null;
        }
    }

    // 4. VLESS, Trojan, SOCKS5, TUIC, Hysteria, Hysteria2 (Standard URL-based)
    try {
        const url = new URL(link);
        const protocol = url.protocol.replace(':', '');
        
        const supportedUrlProtocols = ['vless', 'trojan', 'socks5', 'tuic', 'hysteria', 'hysteria2'];
        if (supportedUrlProtocols.includes(protocol)) {
            const params: Record<string, any> = {};
            url.searchParams.forEach((value, key) => {
                params[key] = value;
            });

            let nodeType = protocol as Node['type'];
            if(protocol === 'vless' && params.security === 'reality') {
                nodeType = 'vless-reality';
            }

            return {
                name: url.hash ? decodeURIComponent(url.hash.substring(1)) : `${url.hostname}:${url.port}`,
                server: url.hostname,
                port: parseInt(url.port, 10),
                password: url.username ? decodeURIComponent(url.username) : undefined,
                type: nodeType,
                params: params,
            };
        }
    } catch(e) {
        // 如果 new URL() 失败，说明不是一个有效的 URL 格式，可以忽略错误继续
    }

    console.warn(`Unsupported or malformed link: ${link}`);
    return null;
}