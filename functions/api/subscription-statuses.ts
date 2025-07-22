import { handleSubscriptionStatuses } from '../core/subscription-statuses';
import { Env } from '@shared/types';

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  return handleSubscriptionStatuses(request, env);
};