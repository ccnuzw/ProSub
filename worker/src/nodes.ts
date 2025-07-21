import { Node } from '@/types';

interface NodeRequest {
  name: string;
  server: string;
  port: number;
  password?: string;
  type: 'ss' | 'ssr' | 'vmess' | 'vless' | 'trojan' | 'socks5' | 'anytls' | 'tuic' | 'hysteria' | 'hysteria2' | 'vless-reality';
}

interface Env {
  KV: KVNamespace;
}

export async function handleNodesGet(request: Request, env: Env): Promise<Response> {
  try {
    const KV = env.KV
    const nodeList = await KV.list({ prefix: 'node:' })
    const nodes = await Promise.all(
      nodeList.keys.map(async ({ name }) => {
        const nodeJson = await KV.get(name)
        return nodeJson ? JSON.parse(nodeJson) : null
      })
    )
    return new Response(JSON.stringify(nodes.filter(Boolean)), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Failed to fetch nodes:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch nodes' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function handleNodesPost(request: Request, env: Env): Promise<Response> {
  try {
    const { name, server, port, password, type } = (await request.json()) as NodeRequest
    const id = crypto.randomUUID()
    const newNode: Node = { id, name, server, port, password, type }
    
    const KV = env.KV
    await KV.put(`node:${id}`, JSON.stringify(newNode))
    
    return new Response(JSON.stringify(newNode), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Failed to create node:', error)
    return new Response(JSON.stringify({ error: 'Failed to create node' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
