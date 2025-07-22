import { handleNodeHealthCheck } from '../_lib/node-health-check';
import { Env } from '../../_lib/types';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleNodeHealthCheck(request, env);
};