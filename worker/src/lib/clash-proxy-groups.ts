// src/lib/clash-proxy-groups.ts
import { Node } from '@/types';

// Helper function to filter nodes by keyword
const filterNodes = (nodes: Node[], keyword: string | RegExp): string[] => {
  const regex = typeof keyword === 'string' ? new RegExp(keyword, 'i') : keyword;
  return nodes.filter(node => regex.test(node.name)).map(node => node.name);
};

export const getClashProxyGroups = (nodes: Node[]) => {
  const nodeNames = nodes.map(n => n.name);

  // Region-specific node groups
  const hkNodes = filterNodes(nodes, /港|HK|Hong Kong/i);
  const twNodes = filterNodes(nodes, /台|TW|Taiwan/i);
  const sgNodes = filterNodes(nodes, /新|SG|Singapore/i);
  const jpNodes = filterNodes(nodes, /日|JP|Japan/i);
  const usNodes = filterNodes(nodes, /美|US|United States/i);
  const krNodes = filterNodes(nodes, /韩|KR|Korea/i);

  const allProxies = ['🚀 节点选择', '♻️ 自动选择', 'DIRECT', ...nodeNames];

  return [
    {
      name: '🚀 节点选择',
      type: 'select',
      proxies: allProxies,
    },
    {
      name: '☑️ 手动切换',
      type: 'select',
      proxies: nodeNames,
    },
    {
      name: '♻️ 自动选择',
      type: 'url-test',
      proxies: nodeNames,
      url: 'http://www.gstatic.com/generate_204',
      interval: 300,
    },
    {
        name: '🐟 漏网之鱼',
        type: 'select',
        proxies: ['REJECT', 'DIRECT'],
    },
    {
        name: '🛑 广告拦截',
        type: 'select',
        proxies: ['REJECT', 'DIRECT'],
    },
    {
        name: '🌏 国内媒体',
        type: 'select',
        proxies: ['DIRECT', '🚀 节点选择'],
    },
    {
        name: '🌍 国外媒体',
        type: 'select',
        proxies: ['🚀 节点选择', '♻️ 自动选择', ...hkNodes, ...twNodes, ...usNodes],
    },
    {
        name: '📹 油管视频',
        type: 'select',
        proxies: ['🌍 国外媒体'],
    },
    {
        name: '🎥 奈飞视频',
        type: 'select',
        proxies: ['🌍 国外媒体'],
    },
    {
        name: '🤖 OpenAi',
        type: 'select',
        proxies: ['🚀 节点选择', '♻️ 自动选择', ...usNodes, ...jpNodes],
    },
    {
        name: '📲 电报消息',
        type: 'select',
        proxies: ['🚀 节点选择', '♻️ 自动选择'],
    },
    {
        name: '🍎 苹果服务',
        type: 'select',
        proxies: ['DIRECT', '🚀 节点选择'],
    },
    {
        name: 'Ⓜ️ 微软服务',
        type: 'select',
        proxies: ['DIRECT', '🚀 节点选择'],
    },
    {
        name: '🎯 全球直连',
        type: 'select',
        proxies: ['DIRECT', '🚀 节点选择'],
    },
    // Region-specific auto-test groups
    {
      name: '🇭🇰 香港节点',
      type: 'url-test',
      proxies: hkNodes.length > 0 ? hkNodes : nodeNames,
      url: 'http://www.gstatic.com/generate_204',
      interval: 300,
    },
    {
      name: '🇹🇼 台湾节点',
      type: 'url-test',
      proxies: twNodes.length > 0 ? twNodes : nodeNames,
      url: 'http://www.gstatic.com/generate_204',
      interval: 300,
    },
    {
      name: '🇸🇬 狮城节点',
      type: 'url-test',
      proxies: sgNodes.length > 0 ? sgNodes : nodeNames,
      url: 'http://www.gstatic.com/generate_204',
      interval: 300,
    },
    {
      name: '🇯🇵 日本节点',
      type: 'url-test',
      proxies: jpNodes.length > 0 ? jpNodes : nodeNames,
      url: 'http://www.gstatic.com/generate_204',
      interval: 300,
    },
    {
      name: '🇺🇲 美国节点',
      type: 'url-test',
      proxies: usNodes.length > 0 ? usNodes : nodeNames,
      url: 'http://www.gstatic.com/generate_204',
      interval: 300,
    },
    {
      name: '🇰🇷 韩国节点',
      type: 'url-test',
      proxies: krNodes.length > 0 ? krNodes : nodeNames,
      url: 'http://www.gstatic.com/generate_204',
      interval: 300,
    },
  ];
};
