import { jsonResponse, errorResponse } from './utils/response';



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
    return jsonResponse(nodeStatuses);
  } catch (error) {
    console.error('Failed to fetch node statuses:', error)
    return errorResponse('获取订阅状态失败');
  }
}
