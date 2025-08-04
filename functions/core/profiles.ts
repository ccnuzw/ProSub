import { jsonResponse, errorResponse } from './utils/response';
import { requireAuth } from './utils/auth';
import { ProfileDataAccess } from './utils/d1-data-access';
import { Env, Profile } from '@shared/types';

interface ProfileRequest {
  name: string;
  description?: string;
  clientType: string;
}

export async function handleProfilesGet(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const profiles = await ProfileDataAccess.getAll(env);
    return jsonResponse(profiles);
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
    const { name, alias, nodeIds, subscriptionIds, clientType } = await request.json() as Profile;
    
    if (!name) {
      return errorResponse('配置文件名称不能为空', 400);
    }

    const newProfile: Profile = {
      id: crypto.randomUUID(),
      name,
      alias,
      nodeIds,
      subscriptionIds,
      clientType: clientType || 'default', // Provide a default value
    };

    const createdProfile = await ProfileDataAccess.create(env, newProfile);
    return jsonResponse(createdProfile);
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
    const { name, alias, nodeIds, subscriptionIds, clientType } = await request.json() as Profile;
    
    const existingProfile = await ProfileDataAccess.getById(env, id);
    if (!existingProfile) {
      return errorResponse('配置文件不存在', 404);
    }

    if (!name) {
      return errorResponse('配置文件名称不能为空', 400);
    }

    const updatedProfile: Profile = {
      ...existingProfile,
      name,
      alias,
      nodeIds,
      subscriptionIds,
      clientType: clientType || existingProfile.clientType || 'default', // Provide a default value or use existing
    };

    const result = await ProfileDataAccess.update(env, id, updatedProfile);
    return jsonResponse(result);
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
    const existingProfile = await ProfileDataAccess.getById(env, id);
    if (!existingProfile) {
      return errorResponse('配置文件不存在', 404);
    }

    await ProfileDataAccess.delete(env, id);

    return jsonResponse({ message: '配置文件删除成功' });
  } catch (error) {
    console.error('删除配置文件失败:', error);
    return errorResponse('删除配置文件失败');
  }
}