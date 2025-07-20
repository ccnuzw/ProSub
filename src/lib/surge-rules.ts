"""// src/lib/surge-rules.ts

// Surge rule format is slightly different from Clash.
// We will define the rules as an array of strings.

export const surgeRules = [
  '# > Advertising',
  'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanAD.list,🛑 广告拦截',
  '',
  '# > Microsoft',
  'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Microsoft.list,Ⓜ️ 微软服务',
  '',
  '# > Apple',
  'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Apple.list,🍎 苹果服务',
  '',
  '# > Telegram',
  'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Telegram.list,📲 电报消息',
  '',
  '# > OpenAI',
  'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/OpenAi.list,🤖 OpenAi',
  '',
  '# > Streaming Media',
  'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/YouTube.list,📹 油管视频',
  'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Netflix.list,🎥 奈飞视频',
  'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyMedia.list,🌍 国外媒体',
  '',
  '# > China Media',
  'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaMedia.list,🌏 国内媒体',
  '',
  '# > GFW',
  'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyGFWlist.list,🚀 节点选择',
  '',
  '# > China',
  'RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaDomain.list,🎯 全球直连',
  'GEOIP,CN,🎯 全球直连',
  '',
  '# > Final',
  'FINAL,🐟 漏网之鱼'
];
"""