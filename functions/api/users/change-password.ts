import { handleUserChangePassword } from '../../_lib/users';
import { Env } from '../../_lib/types';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleUserChangePassword(request, env);
};