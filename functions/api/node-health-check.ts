import { handleNodeHealthCheck } from '../core/node-health-check';
import { Env } from '@shared/types';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleNodeHealthCheck(request, env);
};