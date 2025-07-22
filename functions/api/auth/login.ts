import { handleLogin } from '../../core/auth/login';
import { Env } from '@shared/types';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleLogin(request, env);
};