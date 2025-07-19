export const runtime = 'edge';
import { NextResponse, NextRequest } from 'next/server'
import { Node } from '@/types'

interface NodeRequest {
  name: string;
  server: string;
  port: number;
  password?: string;
  type: 'ss' | 'ssr' | 'vmess' | 'vless' | 'trojan' | 'socks5' | 'anytls' | 'tuic' | 'hysteria' | 'hysteria2' | 'vless-reality';
}

const getKV = () => {
  return process.env.KV as KVNamespace
}

export async function GET(request: NextRequest, { params }: { // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
}) {
  try {
    const KV = getKV()
    const nodeJson = await KV.get(`node:${params.id}`)
    if (!nodeJson) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }
    return NextResponse.json(JSON.parse(nodeJson))
  } catch (error) {
    console.error(`Failed to fetch node ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to fetch node' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
}) {
  try {
    const { name, server, port, password, type } = (await request.json()) as NodeRequest
    const updatedNode: Node = { id: params.id, name, server, port, password, type }
    
    const KV = getKV()
    await KV.put(`node:${params.id}`, JSON.stringify(updatedNode))
    
    return NextResponse.json(updatedNode)
  } catch (error) {
    console.error(`Failed to update node ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to update node' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
}) {
  try {
    const KV = getKV()
    await KV.delete(`node:${params.id}`)
    
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error(`Failed to delete node ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to delete node' }, { status: 500 })
  }
}
