import { handleNodesBatchImport } from '../../core/nodes-batch-import';
import { Env } from '@shared/types';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleNodesBatchImport(request, env);
};