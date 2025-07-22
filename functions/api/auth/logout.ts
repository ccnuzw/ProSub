import { handleLogout } from '../../_lib/auth/logout';
import { Env } from '../_lib/types';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleLogout(request, env);
};