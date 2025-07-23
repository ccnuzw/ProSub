import { handleUserChangePassword } from '../../core/users-id';
import { Env } from '@shared/types';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleUserChangePassword(request, env);
};