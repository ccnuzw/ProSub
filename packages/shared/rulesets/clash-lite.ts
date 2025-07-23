// packages/shared/rulesets/clash-lite.ts
import { Node } from '../types';

export const getClashLiteRules = (nodes: Node[]) => {
  const nodeNames = nodes.map(n => n.name);
  return {
    'proxy-groups': [
      { name: '🚀 PROXY', type: 'select', proxies: ['♻️ AUTO', ...nodeNames] },
      { name: '♻️ AUTO', type: 'url-test', proxies: nodeNames, url: 'http://www.gstatic.com/generate_204', interval: 300 },
    ],
    'rules': [
      'MATCH,🚀 PROXY',
    ],
  };
};
