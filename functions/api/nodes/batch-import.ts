import { handleNodesBatchCreate } from '../../core/nodes';
import { Env } from '@shared/types';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleNodesBatchCreate(request, env);
};