import { NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'

const REGISTRATION_ENABLED_KEY = 'config:registration_enabled'

const getKVNamespace = () => {
  return (process.env as any).PROSUB_KV as KVNamespace
}

export async function GET() {
  try {
    const kv = getKVNamespace()
    const isEnabled = await kv.get(REGISTRATION_ENABLED_KEY)
    // Default to true if not set
    return NextResponse.json({ enabled: isEnabled !== null ? JSON.parse(isEnabled) : true })
  } catch (error) {
    console.error('Failed to get registration status:', error)
    return NextResponse.json({ error: 'Failed to get registration status' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const authenticatedUser = await authenticateUser(request)
  if (!authenticatedUser || authenticatedUser.name !== 'admin') {
    return NextResponse.json({ message: '未授权：只有管理员才能修改注册状态' }, { status: 403 })
  }

  try {
    const { enabled } = await request.json()
    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ message: '无效的请求体' }, { status: 400 })
    }

    const kv = getKVNamespace()
    await kv.put(REGISTRATION_ENABLED_KEY, JSON.stringify(enabled))
    return NextResponse.json({ message: '注册状态更新成功', enabled })
  } catch (error) {
    console.error('Failed to update registration status:', error)
    return NextResponse.json({ error: 'Failed to update registration status' }, { status: 500 })
  }
}