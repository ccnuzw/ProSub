
import { NextResponse } from 'next/server'
import { HealthStatus } from '@/types'

const getKV = () => {
  return process.env.KV as KVNamespace
}

export async function GET() {
  try {
    const KV = getKV()
    const statusList = await KV.list({ prefix: 'node-status:' })
    const nodeStatuses: Record<string, HealthStatus> = {}
    await Promise.all(
      statusList.keys.map(async ({ name }) => {
        const nodeId = name.replace('node-status:', '')
        const statusJson = await KV.get(name)
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
