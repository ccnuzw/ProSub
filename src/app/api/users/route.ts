
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { User } from '@/types'
import { authenticateUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'

const getKVNamespace = () => {
  return process.env.PROSUB_KV as KVNamespace
}

export async function GET(request: Request) {
  const authenticatedUser = await authenticateUser(request)
  if (!authenticatedUser) {
    return NextResponse.json({ message: '未授权' }, { status: 401 })
  }

  try {
    const kv = getKVNamespace()

    // Check for and create default admin user if not exists
    const adminUserKey = 'user:admin' // Using a fixed key for admin
    const adminUser = await kv.get(adminUserKey)

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin', 10) // Default password is 'admin'
      const newAdmin: User = { id: 'admin', name: 'admin', password: hashedPassword, profiles: [], defaultPasswordChanged: false }
      await kv.put(adminUserKey, JSON.stringify(newAdmin))
      console.log('Default admin user created.')
    }

    const userList = await kv.list({ prefix: 'user:' })
    const users = await Promise.all(
      userList.keys.map(async ({ name: keyName }) => {
        const userJson = await kv.get(keyName)
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

export async function POST(request: Request) {
  const authenticatedUser = await authenticateUser(request)
  if (!authenticatedUser) {
    return NextResponse.json({ message: '未授权' }, { status: 401 })
  }

  try {
    const { name, password, profiles } = await request.json()

    if (!name || !password) {
      return NextResponse.json({ message: '用户名和密码是必填项' }, { status: 400 })
    }

    const kv = getKVNamespace()
    // Check if user already exists
    const existingUserList = await kv.list({ prefix: 'user:' })
    const existingUsers = await Promise.all(
      existingUserList.keys.map(async ({ name: keyName }) => {
        const userJson = await kv.get(keyName)
        return userJson ? JSON.parse(userJson) : null
      })
    )
    if (existingUsers.filter(Boolean).some(u => u.name === name)) {
      return NextResponse.json({ message: '用户已存在' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10) // Hash password with salt rounds = 10
    const id = uuidv4()
    const newUser: User = { id, name, password: hashedPassword, profiles: profiles || [], defaultPasswordChanged: true } // New users created via POST have changed password
    
    await kv.put(`user:${id}`, JSON.stringify(newUser))
    
    // Do not return password hash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Failed to create user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
