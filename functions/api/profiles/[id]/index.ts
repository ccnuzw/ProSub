import { handleProfileUpdate, handleProfileDelete } from '../../../core/profiles';
import { Env } from '@shared/types';

export const onRequestPut = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleProfileUpdate(request, env, params.id);
};

export const onRequestDelete = async ({ request, env, params }: { request: Request; env: Env; params: { id: string } }) => {
  return handleProfileDelete(request, env, params.id);
}; 