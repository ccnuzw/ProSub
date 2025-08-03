import { handleSubscriptionGet, handleSubscriptionUpdate, handleSubscriptionDelete } from '../../../core/subscriptions';
import { Env } from '@shared/types';

export const onRequestGet = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleSubscriptionGet(request, env, params.id);
};

export const onRequestPut = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleSubscriptionUpdate(request, env, params.id);
};

export const onRequestDelete = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleSubscriptionDelete(request, env, params.id);
}; 