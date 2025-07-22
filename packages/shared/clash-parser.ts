import * as yaml from 'js-yaml';
import { Node } from './types';

export function parseClashYaml(content: string): Node[] {
  try {
    const doc = yaml.load(content) as any;

    if (doc && doc.proxies && Array.isArray(doc.proxies)) {
      const nodes: Node[] = [];
      for (const proxy of doc.proxies) {
        switch (proxy.type) {
          case 'ss':
            nodes.push({
              id: `${proxy.name}-${proxy.server}-${proxy.port}`,
              type: 'ss',
              name: proxy.name || 'Unknown SS',
              server: proxy.server,
              port: proxy.port,
              password: proxy.password,
              params: {
                cipher: proxy.cipher,
                udp: proxy.udp,
                tfo: proxy.tfo,
              },
            });
            break;
          case 'vmess':
            nodes.push({
              id: `${proxy.name}-${proxy.server}-${proxy.port}`,
              type: 'vmess',
              name: proxy.name || 'Unknown VMess',
              server: proxy.server,
              port: proxy.port,
              params: {
                uuid: proxy.uuid,
                alterId: proxy.alterId,
                cipher: proxy.cipher,
                network: proxy.network,
                tls: proxy.tls,
                'ws-path': proxy['ws-path'],
                'ws-headers': proxy['ws-headers'],
              },
            });
            break;
          case 'vless':
            nodes.push({
              id: `${proxy.name}-${proxy.server}-${proxy.port}`,
              type: 'vless',
              name: proxy.name || 'Unknown VLESS',
              server: proxy.server,
              port: proxy.port,
              params: {
                uuid: proxy.uuid,
                network: proxy.network,
                tls: proxy.tls,
                udp: proxy.udp,
                flow: proxy.flow,
                xver: proxy.xver,
                servername: proxy.servername,
                realityOpts: proxy['reality-opts'],
                clientFingerprint: proxy['client-fingerprint'],
                shortId: proxy.shortId,
                spiderX: proxy.spiderX,
                'ws-path': proxy['ws-path'],
                'ws-headers': proxy['ws-headers'],
              },
            });
            break;
          case 'trojan':
            nodes.push({
              id: `${proxy.name}-${proxy.server}-${proxy.port}`,
              type: 'trojan',
              name: proxy.name || 'Unknown Trojan',
              server: proxy.server,
              port: proxy.port,
              password: proxy.password,
              params: {
                network: proxy.network,
                tls: proxy.tls,
                udp: proxy.udp,
                sni: proxy.sni,
                skipCertVerify: proxy['skip-cert-verify'],
                alpn: proxy.alpn,
                'ws-path': proxy['ws-path'],
                'ws-headers': proxy['ws-headers'],
              },
            });
            break;
          case 'hysteria2':
            nodes.push({
              id: `${proxy.name}-${proxy.server}-${proxy.port}`,
              type: 'hysteria2',
              name: proxy.name || 'Unknown Hysteria2',
              server: proxy.server,
              port: proxy.port,
              password: proxy.password,
              params: {
                obfs: proxy.obfs,
                obfsPassword: proxy['obfs-password'],
                tls: proxy.tls,
                sni: proxy.sni,
                skipCertVerify: proxy['skip-cert-verify'],
                alpn: proxy.alpn,
                fastOpen: proxy['fast-open'],
                udp: proxy.udp,
                auth: proxy.auth,
              },
            });
            break;
          case 'tuic':
            nodes.push({
              id: `${proxy.name}-${proxy.server}-${proxy.port}`,
              type: 'tuic',
              name: proxy.name || 'Unknown TUIC',
              server: proxy.server,
              port: proxy.port,
              password: proxy.password,
              params: {
                uuid: proxy.uuid,
                version: proxy.version,
                congestionController: proxy['congestion-controller'],
                udpRelayMode: proxy['udp-relay-mode'],
                zeroRttHandshake: proxy['zero-rtt-handshake'],
                tls: proxy.tls,
                sni: proxy.sni,
                skipCertVerify: proxy['skip-cert-verify'],
                alpn: proxy.alpn,
                disableSni: proxy['disable-sni'],
              },
            });
            break;
          default:
            break;
        }
      }
      return nodes;
    }
  } catch (e) {
  }
  return [];
}
