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
          id: `${proxy.name}-${proxy.server}-${proxy.port}-${Math.random()}`, // Add random to ensure uniqueness
          name: proxy.name,
          server: proxy.server,
          port: proxy.port,
          type: proxy.type as Node['type'],
          params: { ...proxy }, // Store all original proxy parameters as a backup
        };

        // Map specific fields from Clash proxy to generic Node fields
        switch (proxy.type) {
          case 'ss':
          case 'trojan':
            baseNode.password = proxy.password;
            break;
          case 'vmess':
          case 'vless':
            baseNode.password = proxy.uuid; // Map uuid to password
            break;
          case 'ssr':
          case 'hysteria2':
          case 'tuic':
            baseNode.password = proxy.password;
            break;
        }

        // Remove redundant fields from params that are now top-level
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
    // It's not a valid YAML or doesn't have proxies, which is fine.
  }
  return [];
}