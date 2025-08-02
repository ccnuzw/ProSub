import { handleRuleSetsIdGet, handleRuleSetsIdPut, handleRuleSetsIdDelete } from '../../core/rule-sets';

export async function onRequestGet({ request, env, params }) {
  return handleRuleSetsIdGet(request, env, params.id as string);
}

export async function onRequestPut({ request, env, params }) {
  return handleRuleSetsIdPut(request, env, params.id as string);
}

export async function onRequestDelete({ request, env, params }) {
  return handleRuleSetsIdDelete(request, env, params.id as string);
}