import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { Node } from '@/types'

// This is a placeholder for the KV namespace.
// In a real Cloudflare Workers environment, you would get this from the environment bindings.
const getKVNamespace = () => {
  // In a real application, process.env.PROSUB_KV would be populated by Cloudflare
  return process.env.PROSUB_KV as KVNamespace
}

export async function GET() {
  try {
    const kv = getKVNamespace()
    const nodeList = await kv.list({ prefix: 'node:' })
    const nodes = await Promise.all(
      nodeList.keys.map(async ({ name }) => {
        const nodeJson = await kv.get(name)
        return nodeJson ? JSON.parse(nodeJson) : null
      })
    )
    return NextResponse.json(nodes.filter(Boolean))
  } catch (error) {
    console.error('Failed to fetch nodes:', error)
    return NextResponse.json({ error: 'Failed to fetch nodes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, server, port, password, type } = await request.json()
    const id = uuidv4()
    const newNode: Node = { id, name, server, port, password, type }
    
    const kv = getKVNamespace()
    await kv.put(`node:${id}`, JSON.stringify(newNode))
    
    return NextResponse.json(newNode)
  } catch (error) {
    console.error('Failed to create node:', error)
    return NextResponse.json({ error: 'Failed to create node' }, { status: 500 })
  }
}