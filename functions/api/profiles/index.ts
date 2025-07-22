import { handleProfilesGet, handleProfilesPost } from '../../_lib/profiles';
import { Env } from '../../_lib/types';

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  return handleProfilesGet(request, env);
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleProfilesPost(request, env);
};