// 数据库测试脚本
// 用于验证数据库连接和表结构

async function testDatabase() {
  console.log('开始测试数据库连接...');
  
  try {
    // 测试数据库连接
    const result = await env.DB.prepare('SELECT 1 as test').first();
    console.log('✅ 数据库连接成功:', result);
    
    // 检查所有表
    const tables = await env.DB.prepare(`
      SELECT name FROM sqlite_master WHERE type='table'
    `).all();
    console.log('📋 数据库中的表:', tables.results.map(t => t.name));
    
    // 检查users表结构
    const usersStructure = await env.DB.prepare(`
      PRAGMA table_info(users)
    `).all();
    console.log('👥 users表结构:', usersStructure.results);
    
    // 检查nodes表结构
    const nodesStructure = await env.DB.prepare(`
      PRAGMA table_info(nodes)
    `).all();
    console.log('🖥️ nodes表结构:', nodesStructure.results);
    
    // 检查subscriptions表结构
    const subscriptionsStructure = await env.DB.prepare(`
      PRAGMA table_info(subscriptions)
    `).all();
    console.log('📡 subscriptions表结构:', subscriptionsStructure.results);
    
    // 检查现有数据
    const userCount = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
    const nodeCount = await env.DB.prepare('SELECT COUNT(*) as count FROM nodes').first();
    const subscriptionCount = await env.DB.prepare('SELECT COUNT(*) as count FROM subscriptions').first();
    
    console.log('📊 数据统计:');
    console.log(`- 用户数量: ${userCount.count}`);
    console.log(`- 节点数量: ${nodeCount.count}`);
    console.log(`- 订阅数量: ${subscriptionCount.count}`);
    
  } catch (error) {
    console.error('❌ 数据库测试失败:', error);
  }
}

// 测试创建订阅
async function testCreateSubscription() {
  console.log('\n开始测试创建订阅...');
  
  try {
    const testSubscription = {
      id: crypto.randomUUID(),
      name: '测试订阅',
      url: 'https://example.com/subscription',
      nodeCount: 0
    };
    
    const now = new Date().toISOString();
    
    await env.DB.prepare(`
      INSERT INTO subscriptions (id, name, url, node_count, last_updated, error, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      testSubscription.id,
      testSubscription.name,
      testSubscription.url,
      testSubscription.nodeCount,
      null,
      null,
      now,
      now
    ).run();
    
    console.log('✅ 测试订阅创建成功');
    
    // 验证创建
    const created = await env.DB.prepare(`
      SELECT * FROM subscriptions WHERE id = ?
    `).bind(testSubscription.id).first();
    
    console.log('📋 创建的订阅:', created);
    
    // 清理测试数据
    await env.DB.prepare('DELETE FROM subscriptions WHERE id = ?').bind(testSubscription.id).run();
    console.log('🧹 测试数据已清理');
    
  } catch (error) {
    console.error('❌ 创建订阅测试失败:', error);
  }
}

// 测试创建节点
async function testCreateNode() {
  console.log('\n开始测试创建节点...');
  
  try {
    const testNode = {
      id: crypto.randomUUID(),
      name: '测试节点',
      server: 'test.example.com',
      port: 443,
      password: 'test123',
      type: 'vmess',
      params: {}
    };
    
    const now = new Date().toISOString();
    const params = JSON.stringify(testNode.params);
    
    await env.DB.prepare(`
      INSERT INTO nodes (id, name, server, port, password, type, params, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      testNode.id,
      testNode.name,
      testNode.server,
      testNode.port,
      testNode.password,
      testNode.type,
      params,
      now,
      now
    ).run();
    
    console.log('✅ 测试节点创建成功');
    
    // 验证创建
    const created = await env.DB.prepare(`
      SELECT * FROM nodes WHERE id = ?
    `).bind(testNode.id).first();
    
    console.log('📋 创建的节点:', created);
    
    // 清理测试数据
    await env.DB.prepare('DELETE FROM nodes WHERE id = ?').bind(testNode.id).run();
    console.log('🧹 测试数据已清理');
    
  } catch (error) {
    console.error('❌ 创建节点测试失败:', error);
  }
}

// 运行测试
export async function runTests(request, env) {
  console.log('🚀 开始数据库测试...\n');
  
  await testDatabase();
  await testCreateSubscription();
  await testCreateNode();
  
  console.log('\n✅ 所有测试完成！');
  
  return new Response('测试完成，请查看控制台输出', {
    headers: { 'Content-Type': 'text/plain' }
  });
} 