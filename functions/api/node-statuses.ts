import { handleNodeStatuses } from '../core/node-statuses';
import { Env } from '@shared/types';

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  return handleNodeStatuses(request, env);
};