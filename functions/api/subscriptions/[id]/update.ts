import { handleSubscriptionRefresh } from '../../../core/subscriptions';
import { Env } from '@shared/types';
import { errorResponse } from '../../../core/utils/response';

export const onRequestPost = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  try {
    return handleSubscriptionRefresh(request, env, params.id);
  } catch (error: any) {
    console.error(`Unhandled error in /api/subscriptions/[id]/update:`, error);
    return errorResponse(`服务器内部错误: ${error.message || error}`);
  }
}; 