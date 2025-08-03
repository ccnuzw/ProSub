import { handleSingleNodeHealthCheck } from '../../core/node-health-check';
import { Env } from '@shared/types';

export const onRequestPost = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleSingleNodeHealthCheck(request, env, params.id);
}; 