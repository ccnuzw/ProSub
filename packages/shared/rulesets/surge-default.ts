// packages/shared/rulesets/surge-default.ts
import { Node } from '../types';

const filterNodes = (nodes: Node[], keyword: string | RegExp): string[] => {
  const regex = typeof keyword === 'string' ? new RegExp(keyword, 'i') : keyword;
  return nodes.filter(node => regex.test(node.name)).map(node => node.name);
};

export const getSurgeDefaultRules = (nodes: Node[]) => {
  const nodeNames = nodes.map(n => n.name);

  const hkNodes = filterNodes(nodes, /港|HK|Hong Kong/i);
  const twNodes = filterNodes(nodes, /台|TW|Taiwan/i);
  const sgNodes = filterNodes(nodes, /新|SG|Singapore/i);
  const jpNodes = filterNodes(nodes, /日|JP|Japan/i);
  const usNodes = filterNodes(nodes, /美|US|United States/i);
  const krNodes = filterNodes(nodes, /韩|KR|Korea/i);

  const proxyGroups = [
    `🚀 节点选择 = select, ♻️ 自动选择, DIRECT, ${nodeNames.join(', ')}`,
    `☑️ 手动切换 = select, ${nodeNames.join(', ')}`,
    `♻️ 自动选择 = url-test, ${nodeNames.join(', ')}, url = http://www.gstatic.com/generate_204, interval=300`,
    `🐟 漏网之鱼 = select, 🚀 节点选择, ♻️ 自动选择, DIRECT`,
    `🛑 广告拦截 = select, REJECT, DIRECT`,
    `🌏 国内媒体 = select, DIRECT, 🚀 节点选择`,
    `🌍 国外媒体 = select, 🚀 节点选择, ♻️ 自动选择, ${[...hkNodes, ...twNodes, ...usNodes].join(', ')}`,
    `📹 油管视频 = select, 🌍 国外媒体`,
    `🎥 奈飞视频 = select, 🌍 国外媒体`,
    `🤖 OpenAi = select, 🚀 节点选择, ♻️ 自动选择, ${[...usNodes, ...jpNodes].join(', ')}`,
    `📲 电报消息 = select, 🚀 节点选择, ♻️ 自动选择`,
    `🍎 苹果服务 = select, DIRECT, 🚀 节点选择`,
    `Ⓜ️ 微软服务 = select, DIRECT, 🚀 节点选择`,
    `🎯 全球直连 = select, DIRECT, 🚀 节点选择`,
    `🇭🇰 香港节点 = url-test, ${(hkNodes.length > 0 ? hkNodes : nodeNames).join(', ')}, url = http://www.gstatic.com/generate_204, interval=300`,
    `🇹🇼 台湾节点 = url-test, ${(twNodes.length > 0 ? twNodes : nodeNames).join(', ')}, url = http://www.gstatic.com/generate_204, interval=300`,
    `🇸🇬 狮城节点 = url-test, ${(sgNodes.length > 0 ? sgNodes : nodeNames).join(', ')}, url = http://www.gstatic.com/generate_204, interval=300`,
    `🇯🇵 日本节点 = url-test, ${(jpNodes.length > 0 ? jpNodes : nodeNames).join(', ')}, url = http://www.gstatic.com/generate_204, interval=300`,
    `🇺🇲 美国节点 = url-test, ${(usNodes.length > 0 ? usNodes : nodeNames).join(', ')}, url = http://www.gstatic.com/generate_204, interval=300`,
    `🇰🇷 韩国节点 = url-test, ${(krNodes.length > 0 ? krNodes : nodeNames).join(', ')}, url = http://www.gstatic.com/generate_204, interval=300`,
  ];

  const rules = [
    '# > Advertising',
    'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanAD.list,🛑 广告拦截',
    '# > Microsoft',
    'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Microsoft.list,Ⓜ️ 微软服务',
    '# > Apple',
    'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Apple.list,🍎 苹果服务',
    '# > Telegram',
    'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Telegram.list,📲 电报消息',
    '# > OpenAI',
    'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/OpenAi.list,🤖 OpenAi',
    '# > Streaming Media',
    'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/YouTube.list,📹 油管视频',
    'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Netflix.list,🎥 奈飞视频',
    'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyMedia.list,🌍 国外媒体',
    '# > China Media',
    'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaMedia.list,🌏 国内媒体',
    '# > GFW',
    'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyGFWlist.list,🚀 节点选择',
    '# > China',
    'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaDomain.list,🎯 全球直连',
    'GEOIP,CN,🎯 全球直连',
    '# > Final',
    'FINAL,🐟 漏网之鱼'
  ];

  return {
    'proxy-groups': proxyGroups,
    'rules': rules,
  };
};