import { jsonResponse, errorResponse } from './utils/response';
import { requireAuth } from './utils/auth';
import { Env, Node, Profile, Subscription } from '@shared/types';

export async function handleStatsGet(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const KV = env.KV;

    const nodesJson = await KV.get('ALL_NODES');
    const allNodes: Record<string, Node> = nodesJson ? JSON.parse(nodesJson) : {};
    const nodesCount = Object.keys(allNodes).length;

    const subsJson = await KV.get('ALL_SUBSCRIPTIONS');
    const allSubscriptions: Record<string, Subscription> = subsJson ? JSON.parse(subsJson) : {};
    const subscriptionsCount = Object.keys(allSubscriptions).length;

    const profileIndexJson = await KV.get('_index:profiles');
    const profileIds = profileIndexJson ? JSON.parse(profileIndexJson) : [];
    const profilesCount = profileIds.length;

    const onlineNodesCount = 0; // Placeholder

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