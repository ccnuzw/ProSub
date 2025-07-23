// packages/shared/rulesets/surge-lite.ts
import { Node } from '../types';

export const getSurgeLiteRules = (nodes: Node[]) => {
  const nodeNames = nodes.map(n => n.name);
  return {
    'proxy-groups': [
      `🚀 PROXY = select, ♻️ AUTO, ${nodeNames.join(', ')}`,
      `♻️ AUTO = url-test, ${nodeNames.join(', ')}, url = http://www.gstatic.com/generate_204, interval=300`,
    ],
    'rules': [
      'FINAL,🚀 PROXY',
    ],
  };
};
