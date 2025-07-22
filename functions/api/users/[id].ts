import { handleUserGet, handleUserPut, handleUserDelete } from '../../_lib/users-id';
import { Env } from '../../_lib/types';

export const onRequestGet = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleUserGet(request, env, params.id);
};

export const onRequestPut = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleUserPut(request, env, params.id);
};

export const onRequestDelete = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleUserDelete(request, env, params.id);
};