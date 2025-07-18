import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { User } from '@/types'
import bcrypt from 'bcryptjs'

const REGISTRATION_ENABLED_KEY = 'config:registration_enabled'

const getKVNamespace = () => {
  return process.env.PROSUB_KV as KVNamespace
}

export async function POST(request: Request) {
  try {
    const kv = getKVNamespace()
    const isRegistrationEnabled = await kv.get(REGISTRATION_ENABLED_KEY)
    // Default to true if not set, or if explicitly true
    if (isRegistrationEnabled !== null && !JSON.parse(isRegistrationEnabled)) {
      return NextResponse.json({ message: '注册功能已关闭' }, { status: 403 })
    }

    const { name, password } = await request.json()

    if (!name || !password) {
      return NextResponse.json({ message: '用户名和密码是必填项' }, { status: 400 })
    }

    // Check if user already exists by name
    const userList = await kv.list({ prefix: 'user:' })
    const existingUser = (await Promise.all(
      userList.keys.map(async ({ name: keyName }) => {
        const userJson = await kv.get(keyName)
        return userJson ? JSON.parse(userJson) : null
      })
    )).filter(Boolean).find(u => u.name === name)

    if (existingUser) {
      return NextResponse.json({ message: '用户已存在' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10) // Hash password with salt rounds = 10
    const id = uuidv4()
    const newUser: User = { id, name, password: hashedPassword, profiles: [] } // New users start with no profiles
    
    await kv.put(`user:${id}`, JSON.stringify(newUser))
    
    // Do not return password hash
    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json({ message: '注册成功', user: userWithoutPassword })
  } catch (error) {
    console.error('Failed to register user:', error)
    return NextResponse.json({ error: '注册失败' }, { status: 500 })
  }
}