import { handleNodeStatuses } from '../_lib/node-statuses';
import { Env } from '../../_lib/types';

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  return handleNodeStatuses(request, env);
};