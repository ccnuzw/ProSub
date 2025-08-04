import { handleSubscriptionRefresh } from '../../../core/subscriptions';
import { Env } from '@shared/types';

export const onRequestPost = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleSubscriptionRefresh(request, env, params.id);
}; 