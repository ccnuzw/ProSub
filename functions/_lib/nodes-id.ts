import { jsonResponse, errorResponse } from './utils/response';

interface NodeRequest {
  name: string;
  server: string;
  port: number;
  password?: string;
  type: 'ss' | 'ssr' | 'vmess' | 'vless' | 'trojan' | 'socks5' | 'anytls' | 'tuic' | 'hysteria' | 'hysteria2' | 'vless-reality';
}



export async function handleNodeGet(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const KV = env.KV
    const nodeJson = await KV.get(`node:${id}`)
    if (!nodeJson) {
      return errorResponse('Node not found', 404);
    }
    return jsonResponse(JSON.parse(nodeJson));
  } catch (error) {
    console.error(`Failed to fetch node ${id}:`, error)
    return errorResponse('Failed to fetch node');
  }
}

export async function handleNodePut(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const { name, server, port, password, type } = (await request.json()) as NodeRequest
    const updatedNode: Node = { id, name, server, port, password, type }
    
    const KV = env.KV
    await KV.put(`node:${id}`, JSON.stringify(updatedNode))
    
    return jsonResponse(updatedNode);
  } catch (error) {
    console.error(`Failed to update node ${id}:`, error)
    return errorResponse('Failed to update node');
  }
}

export async function handleNodeDelete(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const KV = env.KV
    await KV.delete(`node:${id}`)
    
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete node ${id}:`, error)
    return errorResponse('Failed to delete node');
  }
}
