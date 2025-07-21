import { HealthStatus } from './types'

interface Env {
  KV: KVNamespace;
}

export async function handleNodeStatuses(request: Request, env: Env): Promise<Response> {
  try {
    const KV = env.KV
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
    return new Response(JSON.stringify(nodeStatuses), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Failed to fetch node statuses:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch node statuses' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
