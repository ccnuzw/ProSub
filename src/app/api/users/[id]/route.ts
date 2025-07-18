import { NextResponse, NextRequest } from 'next/server'
import { User } from '@/types'
import { authenticateUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'

interface UserUpdateRequest {
  name: string;
  password?: string;
  profiles: string[];
}

const getKV = () => {
  return process.env.KV as KVNamespace
}

export async function GET(request: NextRequest, { params }: { // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
}) {
  const authenticatedUser = await authenticateUser(request)
  if (!authenticatedUser) {
    return NextResponse.json({ message: '未授权' }, { status: 401 })
  }

  try {
    const KV = getKV()
    const userJson = await KV.get(`user:${params.id}`)
    if (!userJson) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const user = JSON.parse(userJson)
    // Do not return password hash
    delete user.password
    return NextResponse.json(user)
  } catch (error) {
    console.error(`Failed to fetch user ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
}) {
  const authenticatedUser = await authenticateUser(request)
  if (!authenticatedUser) {
    return NextResponse.json({ message: '未授权' }, { status: 401 })
  }

  try {
    const { name, password, profiles } = (await request.json()) as UserUpdateRequest
    const KV = getKV()
    const userJson = await KV.get(`user:${params.id}`)
    if (!userJson) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const existingUser: User = JSON.parse(userJson)

    let hashedPassword = existingUser.password
    let defaultPasswordChanged = existingUser.defaultPasswordChanged

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10)
      // If admin user is changing password, mark defaultPasswordChanged as true
      if (existingUser.name === 'admin' && existingUser.defaultPasswordChanged === false) {
        defaultPasswordChanged = true
      }
    }

    const updatedUser: User = { 
      id: params.id, 
      name, 
      password: hashedPassword, 
      profiles: profiles || [],
      defaultPasswordChanged: defaultPasswordChanged
    }
    
    await KV.put(`user:${params.id}`, JSON.stringify(updatedUser))
    
    // Do not return password hash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = updatedUser
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error(`Failed to update user ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
}) {
  const authenticatedUser = await authenticateUser(request)
  if (!authenticatedUser) {
    return NextResponse.json({ message: '未授权' }, { status: 401 })
  }

  try {
    const KV = getKV()
    await KV.delete(`user:${params.id}`)
    
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error(`Failed to delete user ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}