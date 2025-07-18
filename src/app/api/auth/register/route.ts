import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { User } from '@/types'
import { scrypt, randomBytes } from 'crypto'
import { promisify } from 'util'

const REGISTRATION_ENABLED_KEY = 'config:registration_enabled'

interface RegisterRequest {
  name: string;
  password: string;
}

const scryptPromise = promisify(scrypt)

const getKV = () => {
  return process.env.KV as KVNamespace
}

export async function POST(request: Request) {
  try {
    const KV = getKV()
    const isRegistrationEnabled = await KV.get(REGISTRATION_ENABLED_KEY)
    // Default to true if not set, or if explicitly true
    if (isRegistrationEnabled !== null && !JSON.parse(isRegistrationEnabled)) {
      return NextResponse.json({ message: '注册功能已关闭' }, { status: 403 })
    }

    const { name, password } = (await request.json()) as RegisterRequest

    if (!name || !password) {
      return NextResponse.json({ message: '用户名和密码是必填项' }, { status: 400 })
    }

    // Check if user already exists by name
    const userList = await KV.list({ prefix: 'user:' })
    const existingUser = (await Promise.all(
      userList.keys.map(async ({ name: keyName }: { name: string }) => {
        const userJson = await KV.get(keyName)
        return userJson ? JSON.parse(userJson) : null
      })
    )).filter(Boolean).find((u: User) => u.name === name)

    if (existingUser) {
      return NextResponse.json({ message: '用户已存在' }, { status: 409 })
    }

    const salt = randomBytes(16).toString('hex')
    const hashedPassword = (await scryptPromise(password, salt, 64)) as Buffer
    const id = uuidv4()
    const newUser: User = { id, name, password: `${salt}:${hashedPassword.toString('hex')}`, profiles: [] } // New users start with no profiles
    
    await KV.put(`user:${id}`, JSON.stringify(newUser))
    
    // Do not return password hash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json({ message: '注册成功', user: userWithoutPassword })
  } catch (error) {
    console.error('Failed to register user:', error)
    return NextResponse.json({ error: '注册失败' }, { status: 500 })
  }
}