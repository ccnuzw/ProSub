// packages/shared/rulesets/loon-lite.ts
import { Node } from '../types';

export const getLoonLiteRules = (nodes: Node[]) => {
  const nodeNames = nodes.map(n => n.name);
  return {
    'proxy-groups': [
      `PROXY = select, AUTO, ${nodeNames.join(', ')}`,
      `AUTO = url-test, ${nodeNames.join(', ')}, url = http://www.gstatic.com/generate_204, interval=300`,
    ],
    'rules': [
      'FINAL,PROXY',
    ],
  };
};
