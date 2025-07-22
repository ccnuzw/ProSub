// src/lib/quantumult-x-rules.ts

// Quantumult X uses [filter_remote] to subscribe to rule sets.
// We will provide a list of these remote filters.

export const quantumultXRules = [
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
