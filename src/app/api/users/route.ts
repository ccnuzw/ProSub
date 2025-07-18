
import { NextResponse, NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { User } from '@/types'
import { authenticateUser } from '@/lib/auth'
import { scrypt, randomBytes } from 'crypto'
import { promisify } from 'util'

interface UserCreateRequest {
  name: string;
  password: string;
  profiles?: string[];
}

const scryptPromise = promisify(scrypt)

const getKV = () => {
  return process.env.KV as KVNamespace
}

export async function GET(request: NextRequest) {
  const authenticatedUser = await authenticateUser(request)
  if (!authenticatedUser) {
    return NextResponse.json({ message: '未授权' }, { status: 401 })
  }

  try {
    const KV = getKV()

    // Check for and create default admin user if not exists
    const adminUserKey = 'user:admin' // Using a fixed key for admin
    const adminUser = await KV.get(adminUserKey)

    if (!adminUser) {
      const salt = randomBytes(16).toString('hex')
      const hashedPassword = (await scryptPromise('admin', salt, 64)) as Buffer
      const newAdmin: User = { id: 'admin', name: 'admin', password: `${salt}:${hashedPassword.toString('hex')}`, profiles: [], defaultPasswordChanged: false }
      await KV.put(adminUserKey, JSON.stringify(newAdmin))
      console.log('Default admin user created.')
    }

    const userList = await KV.list({ prefix: 'user:' })
    const users = await Promise.all(
      userList.keys.map(async ({ name: keyName }) => {
        const userJson = await KV.get(keyName)
        // Do not return password hash
        const user = userJson ? JSON.parse(userJson) : null
        if (user) {
          delete user.password
        }
        return user
      })
    )
    return NextResponse.json(users.filter(Boolean))
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authenticatedUser = await authenticateUser(request)
  if (!authenticatedUser) {
    return NextResponse.json({ message: '未授权' }, { status: 401 })
  }

  try {
    const { name, password, profiles } = (await request.json()) as UserCreateRequest

    if (!name || !password) {
      return NextResponse.json({ message: '用户名和密码是必填项' }, { status: 400 })
    }

    const KV = getKV()
    // Check if user already exists
    const existingUserList = await KV.list({ prefix: 'user:' })
    const existingUsers = await Promise.all(
      existingUserList.keys.map(async ({ name: keyName }) => {
        const userJson = await KV.get(keyName)
        return userJson ? JSON.parse(userJson) : null
      })
    )
    if (existingUsers.filter(Boolean).some(u => u.name === name)) {
      return NextResponse.json({ message: '用户已存在' }, { status: 409 })
    }

    const salt = randomBytes(16).toString('hex')
    const hashedPassword = (await scryptPromise(password, salt, 64)) as Buffer
    const id = uuidv4()
    const newUser: User = { id, name, password: `${salt}:${hashedPassword.toString('hex')}`, profiles: profiles || [], defaultPasswordChanged: true } // New users created via POST have changed password
    
    await KV.put(`user:${id}`, JSON.stringify(newUser))
    
    // Do not return password hash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Failed to create user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
