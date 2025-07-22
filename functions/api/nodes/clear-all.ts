import { handleNodesClearAll } from '../../core/nodes-clear-all';
import { Env } from '@shared/types';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleNodesClearAll(request, env);
};