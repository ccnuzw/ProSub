import * as yaml from 'js-yaml';
import { Node } from './types';

export function parseClashYaml(content: string): Node[] {
  try {
    const doc = yaml.load(content) as any;

    if (doc && doc.proxies && Array.isArray(doc.proxies)) {
      return doc.proxies.map((proxy: any) => {
        if (!proxy || !proxy.name || !proxy.type || !proxy.server || !proxy.port) {
          return null;
        }

        const baseNode: Partial<Node> = {
          id: `${proxy.name}-${proxy.server}-${proxy.port}-${Math.random()}`,
          name: proxy.name,
          server: proxy.server,
          port: proxy.port,
          type: proxy.type as Node['type'],
          params: { ...proxy },
        };

        // ** CORE FIX: Map Clash-specific fields back to our generic Node fields **
        switch (proxy.type) {
          case 'ss':
          case 'ssr':
          case 'trojan':
          case 'hysteria2':
          case 'tuic':
            baseNode.password = proxy.password;
            break;
          case 'vmess':
          case 'vless':
            baseNode.password = proxy.uuid; // Map uuid back to password
            break;
        }

        // Clean up redundant fields from params
        delete baseNode.params?.name;
        delete baseNode.params?.type;
        delete baseNode.params?.server;
        delete baseNode.params?.port;
        delete baseNode.params?.password;
        delete baseNode.params?.uuid;
        
        return baseNode as Node;
      }).filter(Boolean) as Node[];
    }
  } catch (e) {
    // Not a valid YAML, which is fine.
  }
  return [];
}