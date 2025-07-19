// src/app/api/auth/login/route.ts

export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { User } from '@/types';

// Helper function to convert hex string to ArrayBuffer
function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

// Helper function to convert ArrayBuffer to hex string
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.prototype.map.call(new Uint8Array(buffer), (x: number) => ('00' + x.toString(16)).slice(-2)).join('');
}

// Re-implement password comparison using Web Crypto API (SHA-256)
async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    const [salt, key] = hash.split(':');
    if (!salt || !key) return false;

    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password + salt);
    
    const derivedKeyBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);
    const derivedKeyHex = arrayBufferToHex(derivedKeyBuffer);
    
    return derivedKeyHex === key;
  } catch (e) {
    console.error("Password comparison failed", e);
    return false;
  }
}

const getKV = () => {
  // @ts-ignore
  return process.env.KV as KVNamespace;
};

export async function POST(request: Request) {
  const { name, password } = (await request.json()) as { name: string; password: string };

  if (!name || !password) {
    return NextResponse.json({ message: '用户名和密码是必填项' }, { status: 400 });
  }

  const KV = getKV();
  const userList = await KV.list({ prefix: 'user:' });
  const users = await Promise.all(
    userList.keys.map(async ({ name: keyName }: { name: string }) => {
      const userJson = await KV.get(keyName);
      return userJson ? JSON.parse(userJson) : null;
    })
  );
  const user = users.filter(Boolean).find((u: User) => u.name === name) as User | undefined;

  if (!user || !user.password) {
    return NextResponse.json({ message: '用户名或密码不正确' }, { status: 401 });
  }

  const passwordMatch = await comparePassword(password, user.password);

  if (!passwordMatch) {
    return NextResponse.json({ message: '用户名或密码不正确' }, { status: 401 });
  }

  const token = user.id;

  const cookie = serialize('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });

  const responseBody: { message: string; user: { id: string; name: string }; forcePasswordChange?: boolean } = {
    message: '登录成功',
    user: { id: user.id, name: user.name },
  };

  if (user.name === 'admin' && user.defaultPasswordChanged === false) {
    responseBody.forcePasswordChange = true;
  }

  return new Response(JSON.stringify(responseBody), {
    status: 200,
    headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' },
  });
}