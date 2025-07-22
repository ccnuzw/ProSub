import { handleUsersGet, handleUsersPost } from '../../core/users';
import { Env } from '@shared/types';

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  return handleUsersGet(request, env);
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleUsersPost(request, env);
};