// src/lib/sing-box-outbounds.ts
import { Node } from '../types';

const filterNodeTags = (nodes: Node[], keyword: string | RegExp): string[] => {
  const regex = typeof keyword === 'string' ? new RegExp(keyword, 'i') : keyword;
  return nodes.filter(node => regex.test(node.name)).map(node => node.name);
};

export const getSingBoxOutbounds = (nodes: Node[]) => {
  const nodeOutbounds = nodes.map(node => {
    const baseOutbound: any = {
      tag: node.name,
      type: node.type,
      server: node.server,
      server_port: node.port,
    };

    switch (node.type) {
      case 'ss':
        baseOutbound.method = node.params?.method;
        baseOutbound.password = node.password;
        break;
      case 'vmess':
        baseOutbound.uuid = node.password;
        baseOutbound.security = 'auto';
        baseOutbound.alter_id = 0;
        break;
      case 'vless':
        baseOutbound.uuid = node.password;
        baseOutbound.flow = node.params?.flow || '';
        break;
      case 'trojan':
        baseOutbound.password = node.password;
        break;
    }

    if (node.params?.net === 'ws') {
      baseOutbound.transport = {
        type: 'ws',
        path: node.params.path || '/',
        headers: {
          Host: node.params.host || node.server,
        },
      };
    }

    if (node.params?.tls === 'tls' || node.params?.tls === true) {
      baseOutbound.tls = {
        enabled: true,
        server_name: node.params.host || node.server,
        insecure: node.params.allowInsecure === 'true',
      };
    }

    return baseOutbound;
  });

  const nodeNames = nodes.map(n => n.name);
  const hkNodes = filterNodeTags(nodes, /港|HK|Hong Kong/i);
  const twNodes = filterNodeTags(nodes, /台|TW|Taiwan/i);
  const sgNodes = filterNodeTags(nodes, /新|SG|Singapore/i);
  const jpNodes = filterNodeTags(nodes, /日|JP|Japan/i);
  const usNodes = filterNodeTags(nodes, /美|US|United States/i);
  const krNodes = filterNodeTags(nodes, /韩|KR|Korea/i);

  const groupOutbounds = [
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

  return [...nodeOutbounds, ...groupOutbounds];
};
