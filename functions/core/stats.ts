// functions/core/stats.ts

import { jsonResponse, errorResponse } from './utils/response';
import { requireAuth } from './utils/auth';
import { Env, Node, Profile, Subscription, HealthStatus } from '@shared/types';

export async function handleStatsGet(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const KV = env.KV;

    // 获取节点
    const nodesJson = await KV.get('ALL_NODES');
    const allNodes: Record<string, Node> = nodesJson ? JSON.parse(nodesJson) : {};
    const nodesCount = Object.keys(allNodes).length;

    // 获取订阅
    const subsJson = await KV.get('ALL_SUBSCRIPTIONS');
    const allSubscriptions: Record<string, Subscription> = subsJson ? JSON.parse(subsJson) : {};
    const subscriptionsCount = Object.keys(allSubscriptions).length;

    // 获取配置文件
    const profileIndexJson = await KV.get('_index:profiles');
    const profileIds = profileIndexJson ? JSON.parse(profileIndexJson) : [];
    const profilesCount = profileIds.length;

    // 注意：实时计算在线节点数会很慢。这里我们暂时返回0或一个估算值。
    // 一个完整的解决方案需要一个后台任务来定期检查节点状态。
    const onlineNodesCount = 0; // 暂时设置为0

    return jsonResponse({
      nodes: nodesCount,
      subscriptions: subscriptionsCount,
      profiles: profilesCount,
      onlineNodes: onlineNodesCount,
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return errorResponse('Failed to fetch stats');
  }
}