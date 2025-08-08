import { handleSubscriptionsPreview } from '../../../core/subscriptions-preview';
import { Env } from '@shared/types';
import { errorResponse } from '../../../core/utils/response';

export const onRequestGet = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  try {
    return handleSubscriptionsPreview(request, env, params.id);
  } catch (error: any) {
    console.error(`Unhandled error in /api/subscriptions/preview/[id]:`, error);
    return errorResponse(`服务器内部错误: ${error.message || error}`);
  }
};