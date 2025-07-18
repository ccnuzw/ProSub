

import { NextResponse } from 'next/server'
import { Profile, Node, Subscription } from '@/types'
import { Buffer } from 'buffer'

const getKVNamespace = () => {
  return process.env.PROSUB_KV as KVNamespace
}

async function getProfile(kv: KVNamespace, profileId: string): Promise<Profile | null> {
  const profileJson = await kv.get(`profile:${profileId}`)
  return profileJson ? JSON.parse(profileJson) : null
}

async function getNodes(kv: KVNamespace, nodeIds: string[]): Promise<Node[]> {
  const nodes = await Promise.all(
    nodeIds.map(async (id) => {
      const nodeJson = await kv.get(`node:${id}`)
      return nodeJson ? JSON.parse(nodeJson) : null
    })
  )
  return nodes.filter(Boolean)
}

async function getSubscriptions(kv: KVNamespace, subIds: string[]): Promise<Subscription[]> {
  const subs = await Promise.all(
    subIds.map(async (id) => {
      const subJson = await kv.get(`subscription:${id}`)
      return subJson ? JSON.parse(subJson) : null
    })
  )
  return subs.filter(Boolean)
}

// Fetches raw Base64 encoded content from the original subscription URL
async function fetchRawSubscriptionContent(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`Failed to fetch raw subscription from ${url}: ${response.statusText}`)
      return ''
    }
    const content = await response.text()
    // Assuming the raw subscription content is Base64 encoded
    return content
  } catch (error) {
    console.error(`Failed to fetch raw subscription from ${url}:`, error)
    return ''
  }
}

// Converts a Node object to a standard proxy URI scheme
function convertNodeToUri(node: Node): string {
  const encodedName = encodeURIComponent(node.name)
  const commonParams = node.params || {}

  switch (node.type) {
    case 'ss':
      // For SS, the method and password are often base64 encoded together.
      // For simplicity, we'll just use password directly, and rely on url.v1.mk for full SS link generation.
      return `ss://${node.password}@${node.server}:${node.port}#${encodedName}`

    case 'ssr':
      // SSR links are complex. This is a simplified conversion.
      // A full SSR link requires protocol, method, obfs, and their parameters.
      const ssrPasswordBase64 = Buffer.from(node.password || '').toString('base64url') // Base64url encoding
      const ssrParams = new URLSearchParams()
      if (commonParams.protocol) ssrParams.append('protocol', commonParams.protocol)
      if (commonParams.method) ssrParams.append('method', commonParams.method)
      if (commonParams.obfs) ssrParams.append('obfs', commonParams.obfs)
      if (commonParams.protocolparam) ssrParams.append('protocolparam', Buffer.from(commonParams.protocolparam).toString('base64url'))
      if (commonParams.obfsparam) ssrParams.append('obfsparam', Buffer.from(commonParams.obfsparam).toString('base64url'))

      const ssrLink = `ssr://${node.server}:${node.port}:${commonParams.protocol || 'origin'}:${commonParams.method || 'aes-256-cfb'}:${commonParams.obfs || 'plain'}:${ssrPasswordBase64}/?${ssrParams.toString()}#${Buffer.from(node.name).toString('base64url')}`
      return ssrLink

    case 'vmess':
      const vmessConfig = {
        v: "2",
        ps: node.name,
        add: node.server,
        port: node.port,
        id: node.password, // Assuming password is the UUID
        aid: commonParams.aid || "0", // AlterId
        net: commonParams.net || "tcp",
        type: commonParams.type || "none", // e.g., "http", "ws"
        host: commonParams.host || "",
        path: commonParams.path || "",
        tls: commonParams.tls || "", // "tls" or ""
        sni: commonParams.sni || "",
        fp: commonParams.fp || "", // Fingerprint
        alpn: commonParams.alpn || "",
        scy: commonParams.scy || "auto", // Security
        ...commonParams, // Merge any other params
      }
      return `vmess://${Buffer.from(JSON.stringify(vmessConfig)).toString('base64')}`

    case 'vless':
      const vlessParams = new URLSearchParams()
      vlessParams.append('type', commonParams.net || 'tcp') // network type
      if (commonParams.security) vlessParams.append('security', commonParams.security) // tls
      if (commonParams.flow) vlessParams.append('flow', commonParams.flow)
      if (commonParams.sni) vlessParams.append('sni', commonParams.sni)
      if (commonParams.fp) vlessParams.append('fp', commonParams.fp)
      if (commonParams.pbk) vlessParams.append('pbk', commonParams.pbk)
      if (commonParams.sid) vlessParams.append('sid', commonParams.sid)
      if (commonParams.spx) vlessParams.append('spx', commonParams.spx)
      if (commonParams.host) vlessParams.append('host', commonParams.host)
      if (commonParams.path) vlessParams.append('path', commonParams.path)
      if (commonParams.encryption) vlessParams.append('encryption', commonParams.encryption) // none/zero

      return `vless://${node.password}@${node.server}:${node.port}?${vlessParams.toString()}#${encodedName}`

    case 'vless-reality':
      const vlessRealityParams = new URLSearchParams()
      vlessRealityParams.append('type', commonParams.net || 'tcp')
      vlessRealityParams.append('security', 'reality') // Always reality
      if (commonParams.flow) vlessRealityParams.append('flow', commonParams.flow)
      if (commonParams.sni) vlessRealityParams.append('sni', commonParams.sni)
      if (commonParams.fp) vlessRealityParams.append('fp', commonParams.fp)
      if (commonParams.pbk) vlessRealityParams.append('pbk', commonParams.pbk)
      if (commonParams.sid) vlessRealityParams.append('sid', commonParams.sid)
      if (commonParams.spx) vlessRealityParams.append('spx', commonParams.spx)
      if (commonParams.host) vlessRealityParams.append('host', commonParams.host)
      if (commonParams.path) vlessRealityParams.append('path', commonParams.path)
      if (commonParams.encryption) vlessRealityParams.append('encryption', commonParams.encryption)

      return `vless://${node.password}@${node.server}:${node.port}?${vlessRealityParams.toString()}#${encodedName}`

    case 'trojan':
      const trojanParams = new URLSearchParams()
      if (commonParams.sni) trojanParams.append('sni', commonParams.sni)
      if (commonParams.allowInsecure) trojanParams.append('allowInsecure', commonParams.allowInsecure.toString())
      if (commonParams.peer) trojanParams.append('peer', commonParams.peer)
      // Add other Trojan specific params from commonParams
      return `trojan://${node.password}@${node.server}:${node.port}?${trojanParams.toString()}#${encodedName}`

    case 'socks5':
      // SOCKS5 can have username/password. Assuming password field is for password.
      // If username is needed, it should be in params.
      if (node.password) {
        return `socks5://${node.password}@${node.server}:${node.port}#${encodedName}`
      }
      return `socks5://${node.server}:${node.port}#${encodedName}`

    case 'tuic':
      const tuicParams = new URLSearchParams()
      if (commonParams.congestion_control) tuicParams.append('congestion_control', commonParams.congestion_control)
      if (commonParams.udp_relay_mode) tuicParams.append('udp_relay_mode', commonParams.udp_relay_mode)
      if (commonParams.zero_rtt_handshake) tuicParams.append('zero_rtt_handshake', commonParams.zero_rtt_handshake.toString())
      if (commonParams.disable_sni) tuicParams.append('disable_sni', commonParams.disable_sni.toString())
      if (commonParams.sni) tuicParams.append('sni', commonParams.sni)
      if (commonParams.alpn) tuicParams.append('alpn', commonParams.alpn)
      if (commonParams.token) tuicParams.append('token', commonParams.token)
      if (commonParams.fingerprint) tuicParams.append('fingerprint', commonParams.fingerprint)
      if (commonParams.reduce_rtt) tuicParams.append('reduce_rtt', commonParams.reduce_rtt.toString())
      if (commonParams.max_udp_relay_packet_size) tuicParams.append('max_udp_relay_packet_size', commonParams.max_udp_relay_packet_size.toString())

      return `tuic://${node.password}@${node.server}:${node.port}?${tuicParams.toString()}#${encodedName}`

    case 'hysteria':
    case 'hysteria2':
      const hysteriaParams = new URLSearchParams()
      if (commonParams.auth) hysteriaParams.append('auth', commonParams.auth)
      if (commonParams.up_mbps) hysteriaParams.append('up_mbps', commonParams.up_mbps.toString())
      if (commonParams.down_mbps) hysteriaParams.append('down_mbps', commonParams.down_mbps.toString())
      if (commonParams.alpn) hysteriaParams.append('alpn', commonParams.alpn)
      if (commonParams.obfs) hysteriaParams.append('obfs', commonParams.obfs)
      if (commonParams.obfs_password) hysteriaParams.append('obfs_password', commonParams.obfs_password)
      if (commonParams.fast_open) hysteriaParams.append('fast_open', commonParams.fast_open.toString())
      if (commonParams.mptcp) hysteriaParams.append('mptcp', commonParams.mptcp.toString())
      if (commonParams.quic_mode) hysteriaParams.append('quic_mode', commonParams.quic_mode)
      if (commonParams.recv_window) hysteriaParams.append('recv_window', commonParams.recv_window.toString())
      if (commonParams.recv_window_conn) hysteriaParams.append('recv_window_conn', commonParams.recv_window_conn.toString())
      if (commonParams.recv_window_client) hysteriaParams.append('recv_window_client', commonParams.recv_window_client.toString())
      if (commonParams.tls) hysteriaParams.append('tls', commonParams.tls.toString())
      if (commonParams.tls_cert) hysteriaParams.append('tls_cert', commonParams.tls_cert)
      if (commonParams.tls_sni) hysteriaParams.append('tls_sni', commonParams.tls_sni)
      if (commonParams.tls_insecure) hysteriaParams.append('tls_insecure', commonParams.tls_insecure.toString())
      if (commonParams.tls_fingerprint) hysteriaParams.append('tls_fingerprint', commonParams.tls_fingerprint)

      return `${node.type}://${node.server}:${node.port}?${hysteriaParams.toString()}#${encodedName}`

    case 'anytls':
      // AnyTLS is a transport layer. It needs to encapsulate another protocol.
      // For now, we'll just pass through its parameters.
      // A full implementation would require knowing the inner protocol.
      const anytlsParams = new URLSearchParams()
      for (const key in commonParams) {
        anytlsParams.append(key, commonParams[key].toString())
      }
      return `anytls://${node.server}:${node.port}?${anytlsParams.toString()}#${encodedName}`

    default:
      console.warn(`Unsupported node type for direct URI conversion: ${node.type}`)
      return ''
  }
}

// Records a traffic event in KV
async function recordTraffic(kv: KVNamespace, profileId: string) {
  try {
    const timestamp = new Date().toISOString()
    const key = `traffic:${profileId}:${timestamp}`
    await kv.put(key, JSON.stringify({ timestamp, profileId }))
  } catch (error) {
    console.error('Failed to record traffic:', error)
  }
}

export async function GET(request: Request, { params }: { params: { profile_id: string } }) {
  try {
    const kv = getKVNamespace()
    const profile = await getProfile(kv, params.profile_id)

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Record traffic before generating the subscription
    await recordTraffic(kv, params.profile_id)

    const target = request.nextUrl.searchParams.get('target') || 'clash' // Default to clash

    const [manualNodes, subscriptions] = await Promise.all([
      getNodes(kv, profile.nodes || []),
      getSubscriptions(kv, profile.subscriptions || []),
    ])

    // 1. Generate raw node links from manual nodes
    const manualNodeLinks = manualNodes.map(convertNodeToUri).filter(Boolean)

    // 2. Fetch raw Base64 encoded content from subscription URLs
    const rawSubscriptionContentsPromises = subscriptions.map(sub => fetchRawSubscriptionContent(sub.url))
    const rawSubscriptionContents = await Promise.all(rawSubscriptionContentsPromises)

    // Decode and combine all raw node links
    let allRawNodeLinks: string[] = [...manualNodeLinks]
    rawSubscriptionContents.forEach(base64Content => {
      try {
        const decodedContent = Buffer.from(base64Content, 'base64').toString('utf8')
        allRawNodeLinks = allRawNodeLinks.concat(decodedContent.split(/\r?\n/).filter(Boolean))
      } catch (e) {
        console.error('Failed to decode subscription content:', e)
      }
    })

    const combinedRawContent = allRawNodeLinks.join('\n')
    const combinedRawContentBase64 = Buffer.from(combinedRawContent).toString('base64')

    // 3. Use url.v1.mk for final conversion
    const converterUrl = `https://url.v1.mk/sub?target=${target}&url=${encodeURIComponent(`data:text/plain;base64,${combinedRawContentBase64}`)}`

    const converterResponse = await fetch(converterUrl)
    if (!converterResponse.ok) {
      console.error(`Failed to fetch from converter service: ${converterResponse.statusText}`)
      return NextResponse.json({ error: 'Failed to generate subscription from converter service' }, { status: 500 })
    }

    const finalContent = await converterResponse.text()

    return new Response(finalContent, {
      headers: { 'Content-Type': converterResponse.headers.get('Content-Type') || 'text/plain' },
    })

  } catch (error) {
    console.error(`Failed to generate subscription for profile ${params.profile_id}:`, error)
    return NextResponse.json({ error: 'Failed to generate subscription' }, { status: 500 })
  }
}
