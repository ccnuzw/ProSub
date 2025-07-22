import { handleSubscriptionGet, handleSubscriptionPut, handleSubscriptionDelete } from '../../_lib/subscriptions-id';
import { Env } from '../../_lib/types';

export const onRequestGet = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleSubscriptionGet(request, env, params.id);
};

export const onRequestPut = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleSubscriptionPut(request, env, params.id);
};

export const onRequestDelete = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleSubscriptionDelete(request, env, params.id);
};