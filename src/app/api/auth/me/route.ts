export const runtime = 'edge';
import { NextResponse, NextRequest } from 'next/server'
import { authenticateUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await authenticateUser(request)

  if (!user) {
    return NextResponse.json({ message: '未授权' }, { status: 401 })
  }

  // Do not return password in the response
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = user
  return NextResponse.json(userWithoutPassword)
}
