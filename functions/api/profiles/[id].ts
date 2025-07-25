import { handleProfileGet, handleProfilePut, handleProfileDelete } from '../../core/profiles-id';
import { Env } from '@shared/types';

export const onRequestGet = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleProfileGet(request, env, params.id);
};

export const onRequestPut = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleProfilePut(request, env, params.id);
};

export const onRequestDelete = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleProfileDelete(request, env, params.id);
};