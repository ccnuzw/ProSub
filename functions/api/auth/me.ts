import { handleMe } from '../../core/auth/me';
import { Env } from '@shared/types';

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  return handleMe(request, env);
};