import { handleLogin } from '../../_lib/auth/login';
import { Env } from '../_lib/types';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleLogin(request, env);
};