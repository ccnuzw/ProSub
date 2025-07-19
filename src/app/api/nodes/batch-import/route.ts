// src/app/api/nodes/batch-import/route.ts

export const runtime = 'edge';

import { NextResponse, NextRequest } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { parseNodeLink } from '@/lib/node-parser';
import { v4 as uuidv4 } from 'uuid';
import { Node } from '@/types';

const getKV = () => {
  // @ts-ignore
  return process.env.KV as KVNamespace;
};

export async function POST(request: NextRequest) {
  const authenticatedUser = await authenticateUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  try {
    const { links } = (await request.json()) as { links: string };
    if (!links) {
      return NextResponse.json({ message: '请求体中需要提供 links 字符串' }, { status: 400 });
    }

    const linkArray = links.split(/[\r\n]+/).filter(Boolean);
    const parsedNodes: Node[] = [];

    for (const link of linkArray) {
      const parsed = parseNodeLink(link);
      if (parsed) {
        parsedNodes.push({
          id: uuidv4(),
          ...parsed
        } as Node);
      }
    }

    if (parsedNodes.length === 0) {
      return NextResponse.json({ message: '没有找到有效的节点链接' }, { status: 400 });
    }

    const KV = getKV();
    const putPromises = parsedNodes.map(node => KV.put(`node:${node.id}`, JSON.stringify(node)));
    await Promise.all(putPromises);

    return NextResponse.json({ message: `成功导入 ${parsedNodes.length} 个节点` }, { status: 200 });

  } catch (error) {
    console.error('Failed to batch import nodes:', error);
    return NextResponse.json({ error: '批量导入节点时发生错误' }, { status: 500 });
  }
}