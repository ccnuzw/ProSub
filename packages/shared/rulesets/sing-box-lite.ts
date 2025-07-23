// packages/shared/rulesets/sing-box-lite.ts
import { Node } from '../types';

export const getSingBoxLiteRules = (nodes: Node[]) => {
  const nodeNames = nodes.map(n => n.name);
  return {
    outbounds: [
      { tag: 'PROXY', type: 'select', outbounds: ['AUTO', ...nodeNames] },
      { tag: 'AUTO', type: 'url-test', outbounds: nodeNames, url: 'http://www.gstatic.com/generate_204', interval: '5m' },
      { tag: 'DIRECT', type: 'direct' },
      { tag: 'BLOCK', type: 'block' },
      { tag: 'DNS-OUT', type: 'dns' },
    ],
    route: {
      rules: [
        { outbound: 'PROXY' },
      ],
      final: 'PROXY',
    },
  };
};
