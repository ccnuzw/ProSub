import { handleNodesBatchDelete } from '../../_lib/nodes-batch-delete';
import { Env } from '../../_lib/types';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleNodesBatchDelete(request, env);
};