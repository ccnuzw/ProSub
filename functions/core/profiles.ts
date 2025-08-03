import { jsonResponse, errorResponse } from './utils/response';
import { Env, Profile } from '@shared/types';
import { requireAuth } from './utils/auth';

const ALL_PROFILES_KEY = 'ALL_PROFILES';

async function getAllProfiles(env: Env): Promise<Record<string, Profile>> {
  const profilesJson = await env.KV.get(ALL_PROFILES_KEY);
  return profilesJson ? JSON.parse(profilesJson) : {};
}

async function putAllProfiles(env: Env, profiles: Record<string, Profile>): Promise<void> {
  await env.KV.put(ALL_PROFILES_KEY, JSON.stringify(profiles));
}

interface ProfileRequest {
  name: string;
  alias?: string;
  nodeIds: string[];
  subscriptionIds: string[];
  ruleSets?: {
    clash?: { type: 'built-in' | 'custom'; id: string };
    surge?: { type: 'built-in' | 'custom'; id: string };
    quantumultx?: { type: 'built-in' | 'custom'; id: string };
  };
}

export async function handleProfilesGet(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const allProfiles = await getAllProfiles(env);
    return jsonResponse(Object.values(allProfiles));
  } catch (error) {
    console.error('获取配置文件列表失败:', error);
    return errorResponse('获取配置文件列表失败');
  }
}

export async function handleProfilesPost(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { name, alias, nodeIds, subscriptionIds, ruleSets } = (await request.json()) as ProfileRequest;
    
    if (!name) {
      return errorResponse('配置文件名称不能为空', 400);
    }

    const id = crypto.randomUUID();
    const newProfile: Profile = {
      id,
      name,
      alias,
      nodeIds: nodeIds || [],
      subscriptionIds: subscriptionIds || [],
      ruleSets: ruleSets || {},
      nodes: 0,
      subscriptions: 0
    };

    const allProfiles = await getAllProfiles(env);
    allProfiles[id] = newProfile;
    await putAllProfiles(env, allProfiles);

    return jsonResponse(newProfile);
  } catch (error) {
    console.error('创建配置文件失败:', error);
    return errorResponse('创建配置文件失败');
  }
}

export async function handleProfileUpdate(request: Request, env: Env, id: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { name, alias, nodeIds, subscriptionIds, ruleSets } = (await request.json()) as ProfileRequest;
    
    const allProfiles = await getAllProfiles(env);
    const profile = allProfiles[id];

    if (!profile) {
      return errorResponse('配置文件不存在', 404);
    }

    if (!name) {
      return errorResponse('配置文件名称不能为空', 400);
    }

    profile.name = name;
    profile.alias = alias;
    profile.nodeIds = nodeIds || [];
    profile.subscriptionIds = subscriptionIds || [];
    profile.ruleSets = ruleSets || {};

    await putAllProfiles(env, allProfiles);

    return jsonResponse(profile);
  } catch (error) {
    console.error('更新配置文件失败:', error);
    return errorResponse('更新配置文件失败');
  }
}

export async function handleProfileDelete(request: Request, env: Env, id: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const allProfiles = await getAllProfiles(env);
    
    if (!allProfiles[id]) {
      return errorResponse('配置文件不存在', 404);
    }

    delete allProfiles[id];
    await putAllProfiles(env, allProfiles);

    return jsonResponse({ message: '配置文件删除成功' });
  } catch (error) {
    console.error('删除配置文件失败:', error);
    return errorResponse('删除配置文件失败');
  }
}