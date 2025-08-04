import { Env } from '@shared/types';

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  try {
    // 测试KV写入
    const testKey = 'test:kv';
    const testValue = JSON.stringify({ message: 'KV测试成功', timestamp: new Date().toISOString() });
    
    await env.KV.put(testKey, testValue, { expirationTtl: 3600 });
    
    // 测试KV读取
    const retrievedValue = await env.KV.get(testKey);
    
    // 清理测试数据
    await env.KV.delete(testKey);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'KV测试成功',
      written: testValue,
      retrieved: retrievedValue,
      timestamp: new Date().toISOString()
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('KV测试失败:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 