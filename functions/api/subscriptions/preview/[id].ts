import { handleSubscriptionsPreview } from '../../../_lib/subscriptions-preview';
import { Env } from '../../../_lib/types';

export const onRequestGet = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleSubscriptionsPreview(request, env, params.id);
};