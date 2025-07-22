import { authenticateUser } from './lib/auth';
import { jsonResponse, errorResponse } from './utils/response';



// 简单的 URL 验证函数
const isValidUrl = (urlString: string) => {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
};

export async function handleSubscriptionsBatchImport(request: Request, env: Env): Promise<Response> {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return errorResponse('未授权', 401);
  }

  try {
    const { urls } = (await request.json()) as { urls: string };
    if (!urls) {
      return errorResponse('请求体中需要提供 urls 字符串', 400);
    }

    const urlArray = urls.split(new RegExp('[\n]+')).filter(Boolean);
    if (urlArray.length === 0) {
      return errorResponse('未提供任何链接', 400);
    }

    const KV = env.KV;

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
        const id = crypto.randomUUID();
        let name = `导入的订阅 ${importedCount + 1}`;
        try {
            const urlObject = new URL(url);
            if (urlObject.hostname) {
                name = urlObject.hostname;
            }
        } catch (e) {}

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

    return jsonResponse({ 
        message: `导入完成！成功导入 ${importedCount} 个新订阅，跳过 ${skippedCount} 个重复链接和 ${invalidCount} 个无效链接。` 
    });

  } catch (error) {
    console.error('Failed to batch import subscriptions:', error);
    return errorResponse('批量导入订阅时发生错误');
  }
}