// packages/shared/rulesets/quantumult-x-lite.ts
import { Node } from '../types';

export const getQuantumultXLiteRules = (nodes: Node[]) => {
  const nodeNames = nodes.map(n => `"${n.name}"`);
  return {
    'policy': [
      `PROXY = static, ${nodeNames.join(', ')}`,
    ],
    'filter_remote': [
      'final=PROXY',
    ],
  };
};
