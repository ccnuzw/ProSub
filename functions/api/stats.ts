// functions/api/stats.ts

import { handleStatsGet } from '../core/stats';
import { Env } from '@shared/types';

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  return handleStatsGet(request, env);
};