// src/app/api/users/[id]/route.ts

export const runtime = 'edge';

import { NextResponse, NextRequest } from 'next/server';
import { User } from '@/types';
import { authenticateUser } from '@/lib/auth';

// Helper function to convert ArrayBuffer to hex string
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.prototype.map.call(new Uint8Array(buffer), (x: number) => ('00' + x.toString(16)).slice(-2)).join('');
}

// Re-implement password hashing using Web Crypto API (SHA-256)
async function hashPassword(password: string): Promise<string> {
  const saltBuffer = crypto.getRandomValues(new Uint8Array(16));
  const salt = arrayBufferToHex(saltBuffer.buffer);
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password + salt);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);
  const hashHex = arrayBufferToHex(hashBuffer);
  
  return `${salt}:${hashHex}`;
}

const getKV = () => {
  // @ts-ignore
  return process.env.KV as KVNamespace;
};

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authenticatedUser = await authenticateUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  try {
    const KV = getKV();
    const userJson = await KV.get(`user:${params.id}`);
    if (!userJson) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = JSON.parse(userJson);
    delete user.password;
    return NextResponse.json(user);
  } catch (error) {
    console.error(`Failed to fetch user ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authenticatedUser = await authenticateUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  try {
    const { name, password, profiles } = (await request.json()) as { name?: string; password?: string; profiles?: string[] };
    const KV = getKV();
    const userJson = await KV.get(`user:${params.id}`);
    if (!userJson) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const existingUser: User = JSON.parse(userJson);

    let hashedPassword = existingUser.password;
    let defaultPasswordChanged = existingUser.defaultPasswordChanged;

    if (password) {
      hashedPassword = await hashPassword(password);
      if (existingUser.name === 'admin' && existingUser.defaultPasswordChanged === false) {
        defaultPasswordChanged = true;
      }
    }

    // *** 这是关键的修复 ***
    // 先继承所有旧数据，再用新数据覆盖
    const updatedUser: User = { 
      ...existingUser,
      id: params.id, 
      name: name || existingUser.name, // 如果请求中没有提供 name，则保留旧的 name
      password: hashedPassword, 
      profiles: profiles || existingUser.profiles, // 如果请求中没有提供 profiles，则保留旧的
      defaultPasswordChanged: defaultPasswordChanged
    };
    
    await KV.put(`user:${params.id}`, JSON.stringify(updatedUser));
    
    const { password: _, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error(`Failed to update user ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const authenticatedUser = await authenticateUser(request);
    if (!authenticatedUser) {
      return NextResponse.json({ message: '未授权' }, { status: 401 });
    }
  
    try {
      const KV = getKV();
      await KV.delete(`user:${params.id}`);
      
      return new Response(null, { status: 204 });
    } catch (error) {
      console.error(`Failed to delete user ${params.id}:`, error);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}