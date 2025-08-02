import { handleRuleSetsGet, handleRuleSetsPost } from '../../core/rule-sets';

export async function onRequestGet(context) {
  return handleRuleSetsGet(context.request, context.env);
}

export async function onRequestPost(context) {
  return handleRuleSetsPost(context.request, context.env);
}