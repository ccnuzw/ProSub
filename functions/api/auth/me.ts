import { handleMe } from '../../_lib/auth/me';
import { Env } from '../_lib/types';

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  return handleMe(request, env);
};