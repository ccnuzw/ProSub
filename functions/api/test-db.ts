import { Env } from '@shared/types';

// 数据库测试脚本
async function testDatabase(env: Env) {
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
    
    // 如果表不存在，创建表
    if (tables.results.length === 0) {
      console.log('⚠️ 数据库中没有表，正在创建表结构...');
      await createTables(env);
    }
    
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
    
    return { success: true, tables: tables.results, userCount, nodeCount, subscriptionCount };
  } catch (error) {
    console.error('❌ 数据库测试失败:', error);
    return { success: false, error: error.message };
  }
}

// 创建数据库表
async function createTables(env: Env) {
  console.log('🔨 开始创建数据库表...');
  
  try {
    // 创建用户表
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `).run();
    
    // 创建节点表
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS nodes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        server TEXT NOT NULL,
        port INTEGER NOT NULL,
        password TEXT,
        type TEXT NOT NULL,
        params TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `).run();
    
    // 创建节点健康状态表
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS node_health_status (
        node_id TEXT PRIMARY KEY,
        status TEXT NOT NULL DEFAULT 'unknown',
        latency INTEGER,
        last_checked TEXT NOT NULL,
        error TEXT,
        FOREIGN KEY (node_id) REFERENCES nodes (id) ON DELETE CASCADE
      )
    `).run();
    
    // 创建订阅表
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        node_count INTEGER DEFAULT 0,
        last_updated TEXT,
        error TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `).run();
    
    // 创建配置文件表
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        client_type TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `).run();
    
    // 创建配置文件-节点关联表
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS profile_nodes (
        profile_id TEXT NOT NULL,
        node_id TEXT NOT NULL,
        PRIMARY KEY (profile_id, node_id),
        FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
        FOREIGN KEY (node_id) REFERENCES nodes (id) ON DELETE CASCADE
      )
    `).run();
    
    // 创建配置文件-订阅关联表
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS profile_subscriptions (
        profile_id TEXT NOT NULL,
        subscription_id TEXT NOT NULL,
        PRIMARY KEY (profile_id, subscription_id),
        FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
        FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE CASCADE
      )
    `).run();
    
    // 创建订阅规则表
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS subscription_rules (
        id TEXT PRIMARY KEY,
        subscription_id TEXT NOT NULL,
        type TEXT NOT NULL,
        pattern TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE CASCADE
      )
    `).run();
    
    // 创建节点组表
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS node_groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `).run();
    
    // 创建节点组成员表
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS node_group_members (
        group_id TEXT NOT NULL,
        node_id TEXT NOT NULL,
        PRIMARY KEY (group_id, node_id),
        FOREIGN KEY (group_id) REFERENCES node_groups (id) ON DELETE CASCADE,
        FOREIGN KEY (node_id) REFERENCES nodes (id) ON DELETE CASCADE
      )
    `).run();
    
    // 创建流量记录表
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS traffic_records (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        alias TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE
      )
    `).run();
    
    // 创建索引
    await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes (type)').run();
    await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_nodes_server ON nodes (server)').run();
    await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_subscriptions_url ON subscriptions (url)').run();
    await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_profiles_client_type ON profiles (client_type)').run();
    await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_traffic_records_timestamp ON traffic_records (timestamp)').run();
    
    console.log('✅ 所有表创建成功！');
    
    // 创建默认用户
    await env.DB.prepare(`
      INSERT OR REPLACE INTO users (id, username, password, role, created_at, updated_at) 
      VALUES ('admin', 'admin', 'admin123', 'admin', datetime('now'), datetime('now'))
    `).run();
    
    console.log('✅ 默认用户创建成功！');
    
  } catch (error) {
    console.error('❌ 创建表失败:', error);
    throw error;
  }
}

// 测试创建订阅
async function testCreateSubscription(env: Env) {
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
    
    return { success: true, created };
  } catch (error) {
    console.error('❌ 创建订阅测试失败:', error);
    return { success: false, error: error.message };
  }
}

// 测试创建节点
async function testCreateNode(env: Env) {
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
    
    return { success: true, created };
  } catch (error) {
    console.error('❌ 创建节点测试失败:', error);
    return { success: false, error: error.message };
  }
}

// 运行测试
export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  console.log('🚀 开始数据库测试...\n');
  
  const results = {
    database: await testDatabase(env),
    subscription: await testCreateSubscription(env),
    node: await testCreateNode(env)
  };
  
  console.log('\n✅ 所有测试完成！');
  console.log('测试结果:', JSON.stringify(results, null, 2));
  
  return new Response(JSON.stringify(results, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}; 