import { handleNodeGroupsIdGet, handleNodeGroupsIdPut, handleNodeGroupsIdDelete } from '../../core/node-groups';

export async function onRequestGet({ request, env, params }) {
  return handleNodeGroupsIdGet(request, env, params.id as string);
}

export async function onRequestPut({ request, env, params }) {
  return handleNodeGroupsIdPut(request, env, params.id as string);
}

export async function onRequestDelete({ request, env, params }) {
  return handleNodeGroupsIdDelete(request, env, params.id as string);
}