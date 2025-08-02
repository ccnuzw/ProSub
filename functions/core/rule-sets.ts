import { jsonResponse, errorResponse } from './utils/response';
import { CustomRuleSet, Env } from '../../packages/shared/types/index.ts';
import { requireAuth } from './utils/auth';

const ALL_RULE_SETS_KEY = 'ALL_RULE_SETS';

async function getAllRuleSets(env: Env): Promise<Record<string, CustomRuleSet>> {
  const ruleSetsJson = await env.KV.get(ALL_RULE_SETS_KEY);
  return ruleSetsJson ? JSON.parse(ruleSetsJson) : {};
}

async function putAllRuleSets(env: Env, ruleSets: Record<string, CustomRuleSet>): Promise<void> {
  await env.KV.put(ALL_RULE_SETS_KEY, JSON.stringify(ruleSets));
}

interface RuleSetRequest {
  name: string;
  description?: string;
  content: string;
  clientType: 'clash' | 'surge' | 'quantumultx' | 'loon' | 'sing-box' | 'general';
}

export async function handleRuleSetsGet(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const allRuleSets = await getAllRuleSets(env);
    return jsonResponse(Object.values(allRuleSets));
  } catch (error) {
    console.error('Failed to fetch rule sets:', error);
    return errorResponse('Failed to fetch rule sets');
  }
}

export async function handleRuleSetsPost(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { name, description = '', content, clientType } = (await request.json()) as RuleSetRequest;
    
    if (!name) {
      return errorResponse('Rule set name is required', 400);
    }
    
    if (!content) {
      return errorResponse('Rule set content is required', 400);
    }
    
    if (!clientType) {
      return errorResponse('Client type is required', 400);
    }

    const id = crypto.randomUUID();
    const newRuleSet: CustomRuleSet = {
      id,
      name,
      description,
      content,
      clientType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const allRuleSets = await getAllRuleSets(env);
    allRuleSets[id] = newRuleSet;
    await putAllRuleSets(env, allRuleSets);

    return jsonResponse(newRuleSet, 201);
  } catch (error) {
    console.error('Failed to create rule set:', error);
    return errorResponse('Failed to create rule set');
  }
}

export async function handleRuleSetsIdGet(request: Request, env: Env, ruleSetId: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const allRuleSets = await getAllRuleSets(env);
    const ruleSet = allRuleSets[ruleSetId];
    
    if (!ruleSet) {
      return errorResponse('Rule set not found', 404);
    }

    return jsonResponse(ruleSet);
  } catch (error) {
    console.error('Failed to fetch rule set:', error);
    return errorResponse('Failed to fetch rule set');
  }
}

export async function handleRuleSetsIdPut(request: Request, env: Env, ruleSetId: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { name, description, content, clientType } = (await request.json()) as RuleSetRequest;
    
    const allRuleSets = await getAllRuleSets(env);
    const existingRuleSet = allRuleSets[ruleSetId];
    
    if (!existingRuleSet) {
      return errorResponse('Rule set not found', 404);
    }

    const updatedRuleSet: CustomRuleSet = {
      ...existingRuleSet,
      name: name || existingRuleSet.name,
      description: description !== undefined ? description : existingRuleSet.description,
      content: content || existingRuleSet.content,
      clientType: clientType || existingRuleSet.clientType,
      updatedAt: new Date().toISOString()
    };

    allRuleSets[ruleSetId] = updatedRuleSet;
    await putAllRuleSets(env, allRuleSets);

    return jsonResponse(updatedRuleSet);
  } catch (error) {
    console.error('Failed to update rule set:', error);
    return errorResponse('Failed to update rule set');
  }
}

export async function handleRuleSetsIdDelete(request: Request, env: Env, ruleSetId: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const allRuleSets = await getAllRuleSets(env);
    const existingRuleSet = allRuleSets[ruleSetId];
    
    if (!existingRuleSet) {
      return errorResponse('Rule set not found', 404);
    }

    delete allRuleSets[ruleSetId];
    await putAllRuleSets(env, allRuleSets);

    return jsonResponse({ message: 'Rule set deleted successfully' });
  } catch (error) {
    console.error('Failed to delete rule set:', error);
    return errorResponse('Failed to delete rule set');
  }
}