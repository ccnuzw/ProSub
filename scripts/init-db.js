#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 初始化 ProSub D1 数据库...');

try {
  // 读取 schema 文件
  const schemaPath = path.join(__dirname, '..', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  console.log('📋 创建数据库表...');
  
  // 使用 wrangler 执行 schema
  execSync('npx wrangler d1 execute prosub-db --local --file=schema.sql', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log('✅ 数据库初始化完成！');
  console.log('');
  console.log('📝 下一步：');
  console.log('1. 运行 "npm run dev" 启动开发服务器');
  console.log('2. 访问 http://localhost:8788');
  console.log('3. 使用 admin/admin123 登录');
  
} catch (error) {
  console.error('❌ 数据库初始化失败:', error.message);
  process.exit(1);
}