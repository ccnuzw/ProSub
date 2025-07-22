import { handleTrafficGet } from '../core/traffic';
import { Env } from '@shared/types';

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  return handleTrafficGet(request, env);
};