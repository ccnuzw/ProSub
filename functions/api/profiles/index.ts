import { handleProfilesGet, handleProfilesPost } from '../../core/profiles';
import { Env } from '@shared/types';

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  return handleProfilesGet(request, env);
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleProfilesPost(request, env);
};