import { Node } from './types'; // Corrected import path

// Helper to decode base64, handling URL-safe variants
function base64Decode(str: string): string {
    try {
        // Replace URL-safe characters, add padding if missing
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }
        return atob(base64);
    } catch (e) {
        console.error('Failed to decode base64 string:', str, e);
        return '';
    }
}

// A more robust node link parser
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
            console.error('Failed to parse VMess link:', link, e);
            return null;
        }
    }

    if (link.startsWith('ss://')) {
        try {
            // Handle links with remarks after #
            const hashIndex = link.lastIndexOf('#');
            const name = hashIndex !== -1 ? decodeURIComponent(link.substring(hashIndex + 1)) : '';
            const coreUrl = hashIndex !== -1 ? link.substring(0, hashIndex) : link;
            
            const atIndex = coreUrl.indexOf('@');
            if (atIndex === -1) throw new Error("Invalid SS link format: missing '@'");

            const credentialsBase64 = coreUrl.substring(5, atIndex);
            const credentials = base64Decode(credentialsBase64);
            const [method, password] = credentials.split(':');

            const serverInfo = coreUrl.substring(atIndex + 1);
            const lastColonIndex = serverInfo.lastIndexOf(':');
            if (lastColonIndex === -1) throw new Error("Port not found in SS link");

            let server = serverInfo.substring(0, lastColonIndex);
            if (server.startsWith('[') && server.endsWith(']')) {
                server = server.substring(1, server.length - 1); // Handle IPv6
            }
            const port = parseInt(serverInfo.substring(lastColonIndex + 1), 10);
            
            return {
                name: name || `${server}:${port}`,
                server,
                port,
                password,
                type: 'ss',
                params: { method },
            };
        } catch (e) {
            console.error('Failed to parse SS link:', link, e);
            return null;
        }
    }
    
    // Generic URL-based parser for vless, trojan, hysteria2 etc.
    try {
        const url = new URL(link);
        const protocol = url.protocol.replace(':', '');
        const supportedUrlProtocols = ['vless', 'trojan', 'socks', 'hysteria', 'hysteria2'];

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
        // Not a standard URL, which is fine, we just ignore the error and let it fall through.
    }

    console.warn(`Unsupported or malformed link, skipping: ${link}`);
    return null;
}