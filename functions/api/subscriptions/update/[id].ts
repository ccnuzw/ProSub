import { handleSubscriptionsUpdate } from '../../../_lib/subscriptions-update';
import { Env } from '../../../_lib/types';

export const onRequestPost = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleSubscriptionsUpdate(request, env, params.id);
};