import { handleSubscriptionsBatchImport } from '../../_lib/subscriptions-batch-import';
import { Env } from '../../_lib/types';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleSubscriptionsBatchImport(request, env);
};