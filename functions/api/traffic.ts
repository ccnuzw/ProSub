import { handleTrafficGet } from '../_lib/traffic';
import { Env } from '../../_lib/types';

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  return handleTrafficGet(request, env);
};