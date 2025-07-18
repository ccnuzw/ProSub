
import { NextResponse } from 'next/server'
import { serialize } from 'cookie'
import bcrypt from 'bcryptjs'
import { User } from '@/types'

interface LoginRequest {
  name: string;
  password: string;
}

const getKV = () => {
  return process.env.KV as KVNamespace
}

export async function POST(request: Request) {
  const { name, password } = (await request.json()) as LoginRequest

  if (!name || !password) {
    return NextResponse.json({ message: '用户名和密码是必填项' }, { status: 400 })
  }

  const KV = getKV()
  // Find user by name
  const userList = await KV.list({ prefix: 'user:' })
  const users = await Promise.all(
    userList.keys.map(async ({ name: keyName }: { name: string }) => {
      const userJson = await KV.get(keyName)
      return userJson ? JSON.parse(userJson) : null
    })
  )
  const user = users.filter(Boolean).find((u: User) => u.name === name) as User | undefined

  if (!user || !user.password) {
    return NextResponse.json({ message: '用户名或密码不正确' }, { status: 401 })
  }

  // Compare provided password with hashed password
  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    return NextResponse.json({ message: '用户名或密码不正确' }, { status: 401 })
  }

  // For simplicity, we'll use the user ID as a session token.
  // In a real app, use a cryptographically secure, short-lived token.
  const token = user.id

  const cookie = serialize('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  })

  const responseBody: { message: string; user: { id: string; name: string }; forcePasswordChange?: boolean } = {
    message: '登录成功',
    user: { id: user.id, name: user.name },
  }

  // If admin user and defaultPasswordChanged is false, force password change
  if (user.name === 'admin' && user.defaultPasswordChanged === false) {
    responseBody.forcePasswordChange = true
  }

  return new Response(JSON.stringify(responseBody), {
    status: 200,
    headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' },
  })
}
