import { handleNodesBatchImport } from '../../_lib/nodes-batch-import';
import { Env } from '../../_lib/types';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleNodesBatchImport(request, env);
};