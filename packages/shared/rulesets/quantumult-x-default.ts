// packages/shared/rulesets/quantumult-x-default.ts
import { Node } from '../types';

// Helper function to filter nodes by keyword for Quantumult X
const filterNodes = (nodes: Node[], keyword: string | RegExp): string[] => {
  const regex = typeof keyword === 'string' ? new RegExp(keyword, 'i') : keyword;
  return nodes.filter(node => regex.test(node.name)).map(node => `"${node.name}"`);
};

export const getQuantumultXDefaultRules = (nodes: Node[]) => {
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

  const rules = [
    '# > Advertising',
    'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanAD.list, tag=🛑 广告拦截, force-policy=REJECT, enabled=true',
    '',
    '# > Microsoft',
    'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Microsoft.list, tag=Ⓜ️ 微软服务, force-policy=DIRECT, enabled=true',
    '',
    '# > Apple',
    'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Apple.list, tag=🍎 苹果服务, force-policy=DIRECT, enabled=true',
    '',
    '# > Telegram',
    'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Telegram.list, tag=📲 电报消息, force-policy=🚀 节点选择, enabled=true',
    '',
    '# > OpenAI',
    'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/OpenAi.list, tag=🤖 OpenAi, force-policy=🚀 节点选择, enabled=true',
    '',
    '# > Streaming Media',
    'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/YouTube.list, tag=📹 油管视频, force-policy=🌍 国外媒体, enabled=true',
    'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Netflix.list, tag=🎥 奈飞视频, force-policy=🌍 国外媒体, enabled=true',
    'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyMedia.list, tag=🌍 国外媒体, force-policy=🌍 国外媒体, enabled=true',
    '',
    '# > China Media',
    'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaMedia.list, tag=🌏 国内媒体, force-policy=DIRECT, enabled=true',
    '',
    '# > GFW',
    'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyGFWlist.list, tag=🚀 节点选择, force-policy=🚀 节点选择, enabled=true',
    '',
    '# > China',
    'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaDomain.list, tag=🎯 全球直连, force-policy=DIRECT, enabled=true',
    '',
    '# > GeoIP',
    'geoip=cn, 🎯 全球直连',
    '',
    '# > Final',
    'final=🐟 漏网之鱼'
  ];

  return {
    'policy': policies,
    'filter_remote': rules,
  };
};
