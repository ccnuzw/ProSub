// 本地数据库测试脚本
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

console.log('🚀 开始本地数据库测试...\n');

try {
  // 1. 检查wrangler是否安装
  console.log('📋 检查wrangler...');
  execSync('npx wrangler --version', { stdio: 'inherit' });
  
  // 2. 创建本地D1数据库
  console.log('\n🔧 创建本地D1数据库...');
  try {
    execSync('npx wrangler d1 create prosub-db', { stdio: 'inherit' });
    console.log('✅ 本地数据库创建成功');
  } catch (error) {
    console.log('ℹ️ 本地数据库已存在');
  }
  
  // 3. 初始化数据库表
  console.log('\n🔨 初始化数据库表...');
  execSync('npx wrangler d1 execute prosub-db --local --file=schema.sql', { stdio: 'inherit' });
  
  // 4. 创建默认用户
  console.log('\n👤 创建默认用户...');
  execSync('npx wrangler d1 execute prosub-db --local --command="INSERT OR REPLACE INTO users (id, username, password, role, created_at, updated_at) VALUES (\'admin\', \'admin\', \'admin123\', \'admin\', datetime(\'now\'), datetime(\'now\'));"', { stdio: 'inherit' });
  
  // 5. 测试数据库连接
  console.log('\n🧪 测试数据库连接...');
  const testResult = execSync('npx wrangler d1 execute prosub-db --local --command="SELECT 1 as test"', { encoding: 'utf8' });
  console.log('✅ 数据库连接成功:', testResult.trim());
  
  // 6. 检查表结构
  console.log('\n📋 检查表结构...');
  const tables = execSync('npx wrangler d1 execute prosub-db --local --command="SELECT name FROM sqlite_master WHERE type=\'table\'"', { encoding: 'utf8' });
  console.log('📊 数据库中的表:', tables.trim());
  
  // 7. 检查用户数据
  console.log('\n👥 检查用户数据...');
  const users = execSync('npx wrangler d1 execute prosub-db --local --command="SELECT * FROM users"', { encoding: 'utf8' });
  console.log('👤 用户数据:', users.trim());
  
  // 8. 测试创建订阅
  console.log('\n📡 测试创建订阅...');
  const testSubscription = execSync('npx wrangler d1 execute prosub-db --local --command="INSERT INTO subscriptions (id, name, url, node_count, last_updated, error, created_at, updated_at) VALUES (\'test-sub\', \'测试订阅\', \'https://example.com\', 0, NULL, NULL, datetime(\'now\'), datetime(\'now\'));"', { stdio: 'inherit' });
  console.log('✅ 测试订阅创建成功');
  
  // 9. 测试创建节点
  console.log('\n🖥️ 测试创建节点...');
  const testNode = execSync('npx wrangler d1 execute prosub-db --local --command="INSERT INTO nodes (id, name, server, port, password, type, params, created_at, updated_at) VALUES (\'test-node\', \'测试节点\', \'test.example.com\', 443, \'test123\', \'vmess\', \'{}\', datetime(\'now\'), datetime(\'now\'));"', { stdio: 'inherit' });
  console.log('✅ 测试节点创建成功');
  
  // 10. 验证数据
  console.log('\n🔍 验证数据...');
  const subscriptionCount = execSync('npx wrangler d1 execute prosub-db --local --command="SELECT COUNT(*) as count FROM subscriptions"', { encoding: 'utf8' });
  const nodeCount = execSync('npx wrangler d1 execute prosub-db --local --command="SELECT COUNT(*) as count FROM nodes"', { encoding: 'utf8' });
  
  console.log('📊 数据统计:');
  console.log(`- 订阅数量: ${subscriptionCount.trim()}`);
  console.log(`- 节点数量: ${nodeCount.trim()}`);
  
  // 11. 清理测试数据
  console.log('\n🧹 清理测试数据...');
  execSync('npx wrangler d1 execute prosub-db --local --command="DELETE FROM subscriptions WHERE id = \'test-sub\';"', { stdio: 'inherit' });
  execSync('npx wrangler d1 execute prosub-db --local --command="DELETE FROM nodes WHERE id = \'test-node\';"', { stdio: 'inherit' });
  console.log('✅ 测试数据已清理');
  
  console.log('\n🎉 本地数据库测试完成！');
  console.log('\n📝 下一步:');
  console.log('1. 运行 npm run dev 启动前端服务器');
  console.log('2. 运行 npm run dev:backend 启动后端服务器');
  console.log('3. 访问 http://localhost:5173 测试应用');
  console.log('4. 使用默认凭据登录: admin / admin123');
  
} catch (error) {
  console.error('❌ 本地测试失败:', error.message);
  process.exit(1);
} 