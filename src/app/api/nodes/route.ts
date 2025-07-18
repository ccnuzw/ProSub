import { NextResponse, NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
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

export async function GET() {
  try {
    const KV = getKV()
    const nodeList = await KV.list({ prefix: 'node:' })
    const nodes = await Promise.all(
      nodeList.keys.map(async ({ name }) => {
        const nodeJson = await KV.get(name)
        return nodeJson ? JSON.parse(nodeJson) : null
      })
    )
    return NextResponse.json(nodes.filter(Boolean))
  } catch (error) {
    console.error('Failed to fetch nodes:', error)
    return NextResponse.json({ error: 'Failed to fetch nodes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, server, port, password, type } = (await request.json()) as NodeRequest
    const id = uuidv4()
    const newNode: Node = { id, name, server, port, password, type }
    
    const KV = getKV()
    await KV.put(`node:${id}`, JSON.stringify(newNode))
    
    return NextResponse.json(newNode)
  } catch (error) {
    console.error('Failed to create node:', error)
    return NextResponse.json({ error: 'Failed to create node' }, { status: 500 })
  }
}