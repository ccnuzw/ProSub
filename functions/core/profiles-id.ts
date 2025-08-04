import { jsonResponse, errorResponse } from './utils/response';
import { requireAuth } from './utils/auth';
import { ProfileDataAccess } from './utils/d1-data-access';
import { Env, Profile } from '@shared/types';

interface ProfileRequestBody {
  name?: string;
  description?: string;
  clientType?: string;
}

export async function handleProfileGet(request: Request, env: Env, id: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const profile = await ProfileDataAccess.getById(env, id);
    if (!profile) {
      return errorResponse('Profile not found', 404);
    }
    return jsonResponse(profile);
  } catch (error) {
    console.error(`Failed to fetch profile ${id}:`, error);
    return errorResponse('Failed to fetch profile');
  }
}

export async function handleProfilePut(request: Request, env: Env, id: string): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const existingProfile = await ProfileDataAccess.getById(env, id);
    if (!existingProfile) {
      return errorResponse('Profile not found', 404);
    }

    const body: ProfileRequestBody = await request.json();
    const { name, description, clientType } = body;

    const updatedProfile: Profile = {
      ...existingProfile,
      name: name ?? existingProfile.name,
      description: description ?? existingProfile.description,
      clientType: clientType ?? existingProfile.clientType
    };

    const result = await ProfileDataAccess.update(env, id, updatedProfile);
    return jsonResponse(result);
  } catch (error) {
    console.error(`Failed to update profile ${id}:`, error);
    return errorResponse('Failed to update profile');
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
      return errorResponse('Profile not found', 404);
    }

    await ProfileDataAccess.delete(env, id);
    return jsonResponse({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error(`Failed to delete profile ${id}:`, error);
    return errorResponse('Failed to delete profile');
  }
}