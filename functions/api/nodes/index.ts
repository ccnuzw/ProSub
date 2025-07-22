import { handleNodesGet, handleNodesPost } from '../../core/nodes';
import { Env } from '@shared/types';

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  return handleNodesGet(request, env);
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  return handleNodesPost(request, env);
};