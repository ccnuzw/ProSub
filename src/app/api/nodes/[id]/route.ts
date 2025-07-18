
import { NextResponse } from 'next/server'
import { Node } from '@/types'

// This is a placeholder for the KV namespace.
const getKVNamespace = () => {
  return process.env.PROSUB_KV as KVNamespace
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const kv = getKVNamespace()
    const nodeJson = await kv.get(`node:${params.id}`)
    if (!nodeJson) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }
    return NextResponse.json(JSON.parse(nodeJson))
  } catch (error) {
    console.error(`Failed to fetch node ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to fetch node' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { name, server, port, password, type } = await request.json()
    const updatedNode: Node = { id: params.id, name, server, port, password, type }
    
    const kv = getKVNamespace()
    await kv.put(`node:${params.id}`, JSON.stringify(updatedNode))
    
    return NextResponse.json(updatedNode)
  } catch (error) {
    console.error(`Failed to update node ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to update node' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const kv = getKVNamespace()
    await kv.delete(`node:${params.id}`)
    
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error(`Failed to delete node ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to delete node' }, { status: 500 })
  }
}
