import { handleNodeGroupsGet, handleNodeGroupsPost } from '../../core/node-groups';

export async function onRequestGet(context) {
  return handleNodeGroupsGet(context.request, context.env);
}

export async function onRequestPost(context) {
  return handleNodeGroupsPost(context.request, context.env);
}