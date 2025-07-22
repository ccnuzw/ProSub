import { handleUsersGet, handleUsersPost } from '../../_lib/users';
import { Env } from '../../_lib/types';

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  return handleUsersGet(request, env);
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleUsersPost(request, env);
};