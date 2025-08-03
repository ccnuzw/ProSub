import { jsonResponse } from '../../core/utils/response';
import { Env, User } from '@shared/types';

export const onRequestPost = async ({ env }: { env: Env }) => {
  try {
    // 删除现有的用户数据
    await env.KV.delete('ADMIN_USER');
    
    // 创建新的默认用户
    const adminUser: User = {
      id: 'admin',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await env.KV.put('ADMIN_USER', JSON.stringify(adminUser));
    
    return jsonResponse({
      success: true,
      message: '用户数据已重置',
      userData: adminUser
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      error: error.message
    });
  }
}; 