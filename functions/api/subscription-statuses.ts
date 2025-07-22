import { handleSubscriptionStatuses } from '../_lib/subscription-statuses';
import { Env } from '../_lib/types';

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  return handleSubscriptionStatuses(request, env);
};