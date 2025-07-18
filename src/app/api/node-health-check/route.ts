import { NextResponse } from 'next/server'

const getKVNamespace = () => {
  return (process.env as any).PROSUB_KV as KVNamespace
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const server = searchParams.get('server')
  const port = searchParams.get('port')
  const nodeId = searchParams.get('nodeId') // New: Pass nodeId to store status

  if (!server || !port || !nodeId) {
    return NextResponse.json({ error: 'Server, port, and nodeId are required' }, { status: 400 })
  }

  const kv = getKVNamespace()
  let status = 'offline'
  let errorMessage = ''

  try {
    const response = await fetch(`http://${server}:${port}`, { method: 'HEAD', signal: AbortSignal.timeout(5000) })
    if (response.ok) {
      status = 'online'
    } else {
      errorMessage = `HTTP Status: ${response.status}`
    }
  } catch (error: any) {
    errorMessage = error.message
  }

  const healthStatus = {
    status: status,
    timestamp: new Date().toISOString(),
    error: errorMessage,
  }

  // Store the health status in KV
  await kv.put(`node-status:${nodeId}`, JSON.stringify(healthStatus))

  return NextResponse.json(healthStatus)
}