import { Node } from './types';

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

export async function handleNodeGet(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const KV = env.KV
    const nodeJson = await KV.get(`node:${id}`)
    if (!nodeJson) {
      return new Response(JSON.stringify({ error: 'Node not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    }
    return new Response(JSON.stringify(JSON.parse(nodeJson)), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error(`Failed to fetch node ${id}:`, error)
    return new Response(JSON.stringify({ error: 'Failed to fetch node' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function handleNodePut(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const { name, server, port, password, type } = (await request.json()) as NodeRequest
    const updatedNode: Node = { id, name, server, port, password, type }
    
    const KV = env.KV
    await KV.put(`node:${id}`, JSON.stringify(updatedNode))
    
    return new Response(JSON.stringify(updatedNode), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error(`Failed to update node ${id}:`, error)
    return new Response(JSON.stringify({ error: 'Failed to update node' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function handleNodeDelete(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const KV = env.KV
    await KV.delete(`node:${id}`)
    
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error(`Failed to delete node ${id}:`, error)
    return new Response(JSON.stringify({ error: 'Failed to delete node' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
