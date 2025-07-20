"""// src/lib/clash-rules.ts

// These are rule providers, which allow the client to fetch and update rulesets independently.
export const ruleProviders = {
  "ads": {
    "type": "http",
    "behavior": "domain",
    "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanAD.list",
    "path": "./ruleset/ads.list",
    "interval": 86400
  },
  "microsoft": {
    "type": "http",
    "behavior": "classical",
    "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Microsoft.list",
    "path": "./ruleset/microsoft.list",
    "interval": 86400
  },
  "apple": {
      "type": "http",
      "behavior": "classical",
      "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Apple.list",
      "path": "./ruleset/apple.list",
      "interval": 86400
  },
  "telegram": {
      "type": "http",
      "behavior": "classical",
      "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Telegram.list",
      "path": "./ruleset/telegram.list",
      "interval": 86400
  },
  "openai": {
      "type": "http",
      "behavior": "classical",
      "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/OpenAi.list",
      "path": "./ruleset/openai.list",
      "interval": 86400
  },
  "youtube": {
      "type": "http",
      "behavior": "classical",
      "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/YouTube.list",
      "path": "./ruleset/youtube.list",
      "interval": 86400
  },
  "netflix": {
      "type": "http",
      "behavior": "classical",
      "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Netflix.list",
      "path": "./ruleset/netflix.list",
      "interval": 86400
  },
  "proxy_media": {
      "type": "http",
      "behavior": "classical",
      "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyMedia.list",
      "path": "./ruleset/proxy_media.list",
      "interval": 86400
  },
  "china_media": {
      "type": "http",
      "behavior": "classical",
      "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaMedia.list",
      "path": "./ruleset/china_media.list",
      "interval": 86400
  },
  "gfw": {
      "type": "http",
      "behavior": "classical",
      "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyGFWlist.list",
      "path": "./ruleset/gfw.list",
      "interval": 86400
  },
  "direct": {
      "type": "http",
      "behavior": "classical",
      "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaDomain.list",
      "path": "./ruleset/direct.list",
      "interval": 86400
  }
};

// The actual rules that use the providers and some built-in rules.
export const clashRules = [
  'RULE-SET,ads,🛑 广告拦截',
  'RULE-SET,microsoft,Ⓜ️ 微软服务',
  'RULE-SET,apple,🍎 苹果服务',
  'RULE-SET,telegram,📲 电报消息',
  'RULE-SET,openai,🤖 OpenAi',
  'RULE-SET,youtube,📹 油管视频',
  'RULE-SET,netflix,🎥 奈飞视频',
  'RULE-SET,proxy_media,🌍 国外媒体',
  'RULE-SET,china_media,🌏 国内媒体',
  'RULE-SET,gfw,🚀 节点选择',
  'RULE-SET,direct,🎯 全球直连',
  'GEOIP,LAN,🎯 全球直连',
  'GEOIP,CN,🎯 全球直连',
  'MATCH,🐟 漏网之鱼'
];
"""