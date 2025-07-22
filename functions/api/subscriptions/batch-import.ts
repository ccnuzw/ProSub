import { handleSubscriptionsBatchImport } from '../../core/subscriptions-batch-import';
import { Env } from '@shared/types';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleSubscriptionsBatchImport(request, env);
};
