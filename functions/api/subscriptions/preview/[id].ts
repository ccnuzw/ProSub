import { handleSubscriptionsPreview } from '../../../core/subscriptions-preview';
import { Env } from '@shared/types';

export const onRequestGet = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleSubscriptionsPreview(request, env, params.id);
};