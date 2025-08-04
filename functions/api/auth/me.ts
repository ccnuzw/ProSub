import { handleMeGet } from '../../core/auth/me';
import { Env } from '@shared/types';

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  return handleMeGet(request, env);
};