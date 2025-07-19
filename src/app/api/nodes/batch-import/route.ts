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
    if (linkArray.length === 0) {
      return NextResponse.json({ message: '未提供任何链接' }, { status: 400 });
    }

    const KV = getKV();

    // *** 这是升级后的去重逻辑 ***

    // 1. 获取所有已存在的节点
    const nodeList = await KV.list({ prefix: 'node:' });
    const existingNodesJson = await Promise.all(
      nodeList.keys.map(async ({ name }) => KV.get(name))
    );
    const existingNodes: Node[] = existingNodesJson.filter(Boolean).map(json => JSON.parse(json as string));
    
    // 2. 创建一个用于快速查找的 Set，使用更精确的 "服务器:端口:密码" 作为唯一标识
    const existingNodeSet = new Set(
      existingNodes.map(node => `${node.server}:${node.port}:${node.password || ''}`)
    );

    let importedCount = 0;
    let skippedCount = 0;
    const putPromises: Promise<any>[] = [];

    // 3. 遍历并解析新链接，同时进行去重检查
    for (const link of linkArray) {
      const parsed = parseNodeLink(link);
      // 确保解析结果包含去重所需的关键字段
      if (parsed && parsed.server && parsed.port) {
        const uniqueKey = `${parsed.server}:${parsed.port}:${parsed.password || ''}`;
        
        if (!existingNodeSet.has(uniqueKey)) {
          const newNode = {
            id: uuidv4(),
            ...parsed
          } as Node;
          putPromises.push(KV.put(`node:${newNode.id}`, JSON.stringify(newNode)));
          existingNodeSet.add(uniqueKey); // 防止在同一次导入中添加重复项
          importedCount++;
        } else {
          skippedCount++;
        }
      }
    }

    if (putPromises.length > 0) {
      await Promise.all(putPromises);
    }
    
    // 4. 返回一个更详细的结果信息
    return NextResponse.json({ 
        message: `导入完成！成功导入 ${importedCount} 个新节点，因服务器、端口和密码重复而跳过 ${skippedCount} 个节点。` 
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to batch import nodes:', error);
    return NextResponse.json({ error: '批量导入节点时发生错误' }, { status: 500 });
  }
}