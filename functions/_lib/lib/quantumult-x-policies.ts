// src/lib/quantumult-x-policies.ts
import { Node } from '../types';

// Helper function to filter nodes by keyword for Quantumult X
const filterNodes = (nodes: Node[], keyword: string | RegExp): string[] => {
  const regex = typeof keyword === 'string' ? new RegExp(keyword, 'i') : keyword;
  return nodes.filter(node => regex.test(node.name)).map(node => `"${node.name}"`);
};

export const getQuantumultXPolicies = (nodes: Node[]) => {
  const nodeNames = nodes.map(n => `"${n.name}"`);

  // Region-specific node groups
  const hkNodes = filterNodes(nodes, /港|HK|Hong Kong/i);
  const twNodes = filterNodes(nodes, /台|TW|Taiwan/i);
  const sgNodes = filterNodes(nodes, /新|SG|Singapore/i);
  const jpNodes = filterNodes(nodes, /日|JP|Japan/i);
  const usNodes = filterNodes(nodes, /美|US|United States/i);
  const krNodes = filterNodes(nodes, /韩|KR|Korea/i);

  const allProxies = ['🚀 节点选择', '♻️ 自动选择', 'DIRECT', ...nodeNames].join(', ');

  const policies = [
    `🚀 节点选择 = static, ${allProxies}`,
    `☑️ 手动切换 = static, ${nodeNames.join(', ')}`,
    `♻️ 自动选择 = available, ${nodeNames.join(', ')}`,
    `🐟 漏网之鱼 = static, 🚀 节点选择, ♻️ 自动选择, DIRECT`,
    `🛑 广告拦截 = static, REJECT, DIRECT`,
    `🌏 国内媒体 = static, DIRECT, 🚀 节点选择`,
    `🌍 国外媒体 = static, 🚀 节点选择, ♻️ 自动选择, ${[...hkNodes, ...twNodes, ...usNodes].join(', ')}`,
    `📹 油管视频 = static, 🌍 国外媒体`,
    `🎥 奈飞视频 = static, 🌍 国外媒体`,
    `🤖 OpenAi = static, 🚀 节点选择, ♻️ 自动选择, ${[...usNodes, ...jpNodes].join(', ')}`,
    `📲 电报消息 = static, 🚀 节点选择, ♻️ 自动选择`,
    `🍎 苹果服务 = static, DIRECT, 🚀 节点选择`,
    `Ⓜ️ 微软服务 = static, DIRECT, 🚀 节点选择`,
    `🎯 全球直连 = static, DIRECT, 🚀 节点选择`,
    // Region-specific policies
    `🇭🇰 香港节点 = available, ${(hkNodes.length > 0 ? hkNodes : nodeNames).join(', ')}`,
    `🇹🇼 台湾节点 = available, ${(twNodes.length > 0 ? twNodes : nodeNames).join(', ')}`,
    `🇸🇬 狮城节点 = available, ${(sgNodes.length > 0 ? sgNodes : nodeNames).join(', ')}`,
    `🇯🇵 日本节点 = available, ${(jpNodes.length > 0 ? jpNodes : nodeNames).join(', ')}`,
    `🇺🇲 美国节点 = available, ${(usNodes.length > 0 ? usNodes : nodeNames).join(', ')}`,
    `🇰🇷 韩国节点 = available, ${(krNodes.length > 0 ? krNodes : nodeNames).join(', ')}`,
  ];

  return policies;
};
