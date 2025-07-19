// src/app/api/nodes/batch-delete/route.ts

export const runtime = 'edge';

import { NextResponse, NextRequest } from 'next/server';
import { authenticateUser } from '@/lib/auth';

const getKV = () => {
  // @ts-ignore
  return process.env.KV as KVNamespace;
};

export async function POST(request: NextRequest) {
  // 权限验证
  const authenticatedUser = await authenticateUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  try {
    const { ids } = (await request.json()) as { ids: string[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: '请求体中需要提供一个包含节点 ID 的数组' }, { status: 400 });
    }

    const KV = getKV();
    
    // 创建一个包含所有删除操作的 Promise 数组
    const deletePromises = ids.map(id => KV.delete(`node:${id}`));
    
    // 并发执行所有的删除操作
    await Promise.all(deletePromises);

    return NextResponse.json({ message: `${ids.length} 个节点已成功删除` }, { status: 200 });

  } catch (error) {
    console.error('Failed to batch delete nodes:', error);
    return NextResponse.json({ error: '批量删除节点时发生错误' }, { status: 500 });
  }
}