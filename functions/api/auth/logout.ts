import { handleLogout } from '../../core/auth/logout';
import { Env } from '@shared/types';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleLogout(request, env);
};