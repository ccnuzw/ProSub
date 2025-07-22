import { handleSubscriptionsGet, handleSubscriptionsPost } from '../../_lib/subscriptions';
import { Env } from '../../_lib/types';

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  return handleSubscriptionsGet(request, env);
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleSubscriptionsPost(request, env);
};