import { runTests } from '../../../test-db';
import { Env } from '@shared/types';

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  return runTests(request, env);
}; 