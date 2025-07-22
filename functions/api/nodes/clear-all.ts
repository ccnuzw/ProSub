import { handleNodesClearAll } from '../../_lib/nodes-clear-all';
import { Env } from '../../_lib/types';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleNodesClearAll(request, env);
};