import { handleSubscriptionsGet, handleSubscriptionsPost } from '../../core/subscriptions';
import { Env } from '@shared/types';

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  return handleSubscriptionsGet(request, env);
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleSubscriptionsPost(request, env);
};