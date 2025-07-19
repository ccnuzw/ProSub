// src/app/api/users/route.ts

export const runtime = 'edge';

import { NextResponse, NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@/types';
import { authenticateUser } from '@/lib/auth';

// Helper function to convert ArrayBuffer to hex string
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.prototype.map.call(new Uint8Array(buffer), (x: number) => ('00' + x.toString(16)).slice(-2)).join('');
}

// Re-implement password hashing using Web Crypto API (SHA-256)
async function hashPassword(password: string): Promise<string> {
  const salt = arrayBufferToHex(crypto.getRandomValues(new Uint8Array(16)));
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

export async function GET(request: NextRequest) {
  const authenticatedUser = await authenticateUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  try {
    const KV = getKV();
    const adminUserKey = 'user:admin';
    const adminUser = await KV.get(adminUserKey);

    if (!adminUser) {
      const hashedPassword = await hashPassword('admin');
      const newAdmin: User = { id: 'admin', name: 'admin', password: hashedPassword, profiles: [], defaultPasswordChanged: false };
      await KV.put(adminUserKey, JSON.stringify(newAdmin));
      console.log('Default admin user created.');
    }

    const userList = await KV.list({ prefix: 'user:' });
    const users = await Promise.all(
      userList.keys.map(async ({ name: keyName }) => {
        const userJson = await KV.get(keyName);
        const user = userJson ? JSON.parse(userJson) : null;
        if (user) {
          delete user.password;
        }
        return user;
      })
    );
    return NextResponse.json(users.filter(Boolean));
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authenticatedUser = await authenticateUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  try {
    const { name, password, profiles } = (await request.json()) as { name: string; password: string; profiles?: string[] };

    if (!name || !password) {
      return NextResponse.json({ message: '用户名和密码是必填项' }, { status: 400 });
    }

    const KV = getKV();
    const existingUserList = await KV.list({ prefix: 'user:' });
    const existingUsers = await Promise.all(
      existingUserList.keys.map(async ({ name: keyName }) => {
        const userJson = await KV.get(keyName);
        return userJson ? JSON.parse(userJson) : null;
      })
    );
    if (existingUsers.filter(Boolean).some(u => u.name === name)) {
      return NextResponse.json({ message: '用户已存在' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const id = uuidv4();
    const newUser: User = { id, name, password: hashedPassword, profiles: profiles || [], defaultPasswordChanged: true };
    
    await KV.put(`user:${id}`, JSON.stringify(newUser));
    
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}