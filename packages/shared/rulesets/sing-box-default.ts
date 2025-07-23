// packages/shared/rulesets/sing-box-default.ts
import { Node } from '../types';

const filterNodeTags = (nodes: Node[], keyword: string | RegExp): string[] => {
  const regex = typeof keyword === 'string' ? new RegExp(keyword, 'i') : keyword;
  return nodes.filter(node => regex.test(node.name)).map(node => node.name);
};

export const getSingBoxDefaultRules = (nodes: Node[]) => {
  const nodeNames = nodes.map(n => n.name);
  const hkNodes = filterNodeTags(nodes, /港|HK|Hong Kong/i);
  const twNodes = filterNodeTags(nodes, /台|TW|Taiwan/i);
  const sgNodes = filterNodeTags(nodes, /新|SG|Singapore/i);
  const jpNodes = filterNodeTags(nodes, /日|JP|Japan/i);
  const usNodes = filterNodeTags(nodes, /美|US|United States/i);
  const krNodes = filterNodeTags(nodes, /韩|KR|Korea/i);

  const outbounds = [
    // --- Functional Groups ---
    { tag: '🚀 节点选择', type: 'select', outbounds: ['♻️ 自动选择', 'DIRECT', ...nodeNames] },
    { tag: '☑️ 手动切换', type: 'select', outbounds: nodeNames },
    { tag: '♻️ 自动选择', type: 'url-test', outbounds: nodeNames, url: 'http://www.gstatic.com/generate_204', interval: '5m' },
    { tag: '🐟 漏网之鱼', type: 'select', outbounds: ['BLOCK', 'DIRECT'] },
    { tag: '🛑 广告拦截', type: 'select', outbounds: ['BLOCK', 'DIRECT'] },
    { tag: '🌏 国内媒体', type: 'select', outbounds: ['DIRECT', '🚀 节点选择'] },
    { tag: '🌍 国外媒体', type: 'select', outbounds: ['🚀 节点选择', '♻️ 自动选择', ...hkNodes, ...twNodes, ...usNodes] },
    { tag: '📹 油管视频', type: 'select', outbounds: ['🌍 国外媒体'] },
    { tag: '🎥 奈飞视频', type: 'select', outbounds: ['🌍 国外媒体'] },
    { tag: '🤖 OpenAi', type: 'select', outbounds: ['🚀 节点选择', '♻️ 自动选择', ...usNodes, ...jpNodes] },
    { tag: '📲 电报消息', type: 'select', outbounds: ['🚀 节点选择', '♻️ 自动选择'] },
    { tag: '🍎 苹果服务', type: 'select', outbounds: ['DIRECT', '🚀 节点选择'] },
    { tag: 'Ⓜ️ 微软服务', type: 'select', outbounds: ['DIRECT', '🚀 节点选择'] },
    { tag: '🎯 全球直连', type: 'select', outbounds: ['DIRECT', '🚀 节点选择'] },
    // --- Region Groups ---
    { tag: '🇭🇰 香港节点', type: 'url-test', outbounds: hkNodes.length > 0 ? hkNodes : nodeNames, url: 'http://www.gstatic.com/generate_204', interval: '5m' },
    { tag: '🇹🇼 台湾节点', type: 'url-test', outbounds: twNodes.length > 0 ? twNodes : nodeNames, url: 'http://www.gstatic.com/generate_204', interval: '5m' },
    { tag: '🇸🇬 狮城节点', type: 'url-test', outbounds: sgNodes.length > 0 ? sgNodes : nodeNames, url: 'http://www.gstatic.com/generate_204', interval: '5m' },
    { tag: '🇯🇵 日本节点', type: 'url-test', outbounds: jpNodes.length > 0 ? jpNodes : nodeNames, url: 'http://www.gstatic.com/generate_204', interval: '5m' },
    { tag: '🇺🇲 美国节点', type: 'url-test', outbounds: usNodes.length > 0 ? usNodes : nodeNames, url: 'http://www.gstatic.com/generate_204', interval: '5m' },
    { tag: '🇰🇷 韩国节点', type: 'url-test', outbounds: krNodes.length > 0 ? krNodes : nodeNames, url: 'http://www.gstatic.com/generate_204', interval: '5m' },
    // --- Built-in Groups ---
    { tag: 'DIRECT', type: 'direct' },
    { tag: 'BLOCK', type: 'block' },
    { tag: 'DNS-OUT', type: 'dns' },
  ];

  const ruleSets = [
    { tag: 'ads', type: 'remote', format: 'text', url: 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanAD.list', download_detour: 'DIRECT' },
    { tag: 'microsoft', type: 'remote', format: 'text', url: 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Microsoft.list', download_detour: 'DIRECT' },
    { tag: 'apple', type: 'remote', format: 'text', url: 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Apple.list', download_detour: 'DIRECT' },
    { tag: 'telegram', type: 'remote', format: 'text', url: 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Telegram.list', download_detour: 'DIRECT' },
    { tag: 'openai', type: 'remote', format: 'text', url: 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/OpenAi.list', download_detour: 'DIRECT' },
    { tag: 'youtube', type: 'remote', format: 'text', url: 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/YouTube.list', download_detour: 'DIRECT' },
    { tag: 'netflix', type: 'remote', format: 'text', url: 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Netflix.list', download_detour: 'DIRECT' },
    { tag: 'proxy_media', type: 'remote', format: 'text', url: 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyMedia.list', download_detour: 'DIRECT' },
    { tag: 'china_media', type: 'remote', format: 'text', url: 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaMedia.list', download_detour: 'DIRECT' },
    { tag: 'gfw', type: 'remote', format: 'text', url: 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyGFWlist.list', download_detour: 'DIRECT' },
    { tag: 'direct', type: 'remote', format: 'text', url: 'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaDomain.list', download_detour: 'DIRECT' },
    { tag: 'geoip-cn', type: 'remote', format: 'binary', url: 'https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/geoip-cn.srs', download_detour: 'DIRECT' },
  ];

  const rules = [
    { rule_set: 'ads', outbound: '🛑 广告拦截' },
    { rule_set: 'microsoft', outbound: 'Ⓜ️ 微软服务' },
    { rule_set: 'apple', outbound: '🍎 苹果服务' },
    { rule_set: 'telegram', outbound: '📲 电报消息' },
    { rule_set: 'openai', outbound: '🤖 OpenAi' },
    { rule_set: 'youtube', outbound: '📹 油管视频' },
    { rule_set: 'netflix', outbound: '🎥 奈飞视频' },
    { rule_set: 'proxy_media', outbound: '🌍 国外媒体' },
    { rule_set: 'china_media', outbound: '🌏 国内媒体' },
    { rule_set: 'gfw', outbound: '🚀 节点选择' },
    { rule_set: 'direct', outbound: '🎯 全球直连' },
    { rule_set: 'geoip-cn', outbound: '🎯 全球直连' },
    { network: 'udp', port: 443, outbound: 'BLOCK' }, // QUIC
    { protocol: ['dns'], outbound: 'DNS-OUT' },
  ];

  return {
    outbounds: outbounds,
    route: {
      rule_set: ruleSets,
      rules: rules,
      final: '🐟 漏网之鱼',
    },
  };
};
