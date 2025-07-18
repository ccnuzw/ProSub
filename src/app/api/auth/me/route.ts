
import { NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'

export async function GET(request: Request) {
  const user = await authenticateUser(request)

  if (!user) {
    return NextResponse.json({ message: '未授权' }, { status: 401 })
  }

  // Do not return password in the response
  const { password, ...userWithoutPassword } = user
  return NextResponse.json(userWithoutPassword)
}
