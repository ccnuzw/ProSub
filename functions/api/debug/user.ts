import { jsonResponse } from '../../core/utils/response';
import { Env } from '@shared/types';

export const onRequestGet = async ({ env }: { env: Env }) => {
  try {
    const adminUserJson = await env.KV.get('ADMIN_USER');
    const adminUser = adminUserJson ? JSON.parse(adminUserJson) : null;
    
    return jsonResponse({
      hasUser: !!adminUser,
      userData: adminUser,
      kvKeys: await env.KV.list()
    });
  } catch (error) {
    return jsonResponse({
      error: error.message,
      hasUser: false,
      userData: null
    });
  }
}; 