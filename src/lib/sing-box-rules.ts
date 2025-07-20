"""// src/lib/sing-box-rules.ts

export const getSingBoxRoute = () => {
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
    rule_set: ruleSets,
    rules: rules,
    final: '🐟 漏网之鱼',
  };
};
"""