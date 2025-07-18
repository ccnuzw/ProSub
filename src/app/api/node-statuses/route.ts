
import { NextResponse } from 'next/server'

const getKVNamespace = () => {
  return (process.env as any).PROSUB_KV as KVNamespace
}

export async function GET() {
  try {
    const kv = getKVNamespace()
    const statusList = await kv.list({ prefix: 'node-status:' })
    const nodeStatuses: Record<string, any> = {}
    await Promise.all(
      statusList.keys.map(async ({ name }) => {
        const nodeId = name.replace('node-status:', '')
        const statusJson = await kv.get(name)
        if (statusJson) {
          nodeStatuses[nodeId] = JSON.parse(statusJson)
        }
      })
    )
    return NextResponse.json(nodeStatuses)
  } catch (error) {
    console.error('Failed to fetch node statuses:', error)
    return NextResponse.json({ error: 'Failed to fetch node statuses' }, { status: 500 })
  }
}
