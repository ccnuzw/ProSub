import { handleNodesGet, handleNodesPost } from '../../_lib/nodes';
import { Env } from '../../_lib/types';

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  return handleNodesGet(request, env);
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleNodesPost(request, env);
};