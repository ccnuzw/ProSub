import { handleNodeGet, handleNodePut, handleNodeDelete } from '../../core/nodes-id';
import { Env } from '@shared/types';

export const onRequestGet = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleNodeGet(request, env, params.id);
};

export const onRequestPut = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleNodePut(request, env, params.id);
};

export const onRequestDelete = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleNodeDelete(request, env, params.id);
};