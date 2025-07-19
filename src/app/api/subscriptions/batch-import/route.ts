// src/app/api/subscriptions/batch-import/route.ts

export const runtime = 'edge';

import { NextResponse, NextRequest } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { Subscription } from '@/types';

const getKV = () => {
  // @ts-ignore
  return process.env.KV as KVNamespace;
};

// 简单的 URL 验证函数
const isValidUrl = (urlString: string) => {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
};

export async function POST(request: NextRequest) {
  const authenticatedUser = await authenticateUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  try {
    const { urls } = (await request.json()) as { urls: string };
    if (!urls) {
      return NextResponse.json({ message: '请求体中需要提供 urls 字符串' }, { status: 400 });
    }

    const urlArray = urls.split(/[\r\n]+/).filter(Boolean);
    if (urlArray.length === 0) {
      return NextResponse.json({ message: '未提供任何链接' }, { status: 400 });
    }

    const KV = getKV();

    // --- 去重逻辑 ---
    const subList = await KV.list({ prefix: 'subscription:' });
    const existingSubsJson = await Promise.all(
      subList.keys.map(async ({ name }) => KV.get(name))
    );
    const existingSubs: Subscription[] = existingSubsJson.filter(Boolean).map(json => JSON.parse(json as string));
    const existingUrlSet = new Set(existingSubs.map(sub => sub.url));

    let importedCount = 0;
    let skippedCount = 0;
    let invalidCount = 0;
    const putPromises: Promise<any>[] = [];

    for (const url of urlArray) {
      if (!isValidUrl(url)) {
        invalidCount++;
        continue;
      }
      if (!existingUrlSet.has(url)) {
        const id = uuidv4();
        // 尝试从 URL 中提取一个有意义的名字
        let name = `导入的订阅 ${importedCount + 1}`;
        try {
            const urlObject = new URL(url);
            if (urlObject.hostname) {
                name = urlObject.hostname;
            }
        } catch {}

        const newSubscription: Subscription = { id, name, url };
        putPromises.push(KV.put(`subscription:${id}`, JSON.stringify(newSubscription)));
        existingUrlSet.add(url);
        importedCount++;
      } else {
        skippedCount++;
      }
    }

    if (putPromises.length > 0) {
      await Promise.all(putPromises);
    }

    return NextResponse.json({ 
        message: `导入完成！成功导入 ${importedCount} 个新订阅，跳过 ${skippedCount} 个重复链接和 ${invalidCount} 个无效链接。` 
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to batch import subscriptions:', error);
    return NextResponse.json({ error: '批量导入订阅时发生错误' }, { status: 500 });
  }
}