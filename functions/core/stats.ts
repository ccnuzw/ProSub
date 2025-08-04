import { jsonResponse, errorResponse } from './utils/response';
import { requireAuth } from './utils/auth';
import { NodeDataAccess, SubscriptionDataAccess, ProfileDataAccess } from './utils/d1-data-access';
import { Env } from '@shared/types';

export async function handleStatsGet(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    // 使用D1数据库获取统计数据
    const nodes = await NodeDataAccess.getAll(env);
    const subscriptions = await SubscriptionDataAccess.getAll(env);
    const profiles = await ProfileDataAccess.getAll(env);
    
    const nodesCount = nodes.length;
    const subscriptionsCount = subscriptions.length;
    const profilesCount = profiles.length;
    
    // TODO: 从D1数据库获取在线节点数量
    const onlineNodesCount = 0; // 暂时设为0，需要实现健康状态查询

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