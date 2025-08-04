# 🧪 本地测试流程指南

## 🚀 快速开始

### 1. 环境准备

```bash
# 检查Node.js版本
node --version  # 需要 >= 20.11.1

# 检查npm版本
npm --version

# 安装依赖
npm install
```

### 2. 初始化数据库

```bash
# 初始化D1数据库架构
npx wrangler d1 execute prosub-db --local --file=schema.sql

# 创建默认用户
npx wrangler d1 execute prosub-db --local --command="INSERT OR REPLACE INTO users (id, username, password, role, created_at, updated_at) VALUES ('admin', 'admin', 'admin123', 'admin', datetime('now'), datetime('now'));"

# 验证数据库状态
npx wrangler d1 execute prosub-db --local --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### 3. 启动本地开发环境

#### 启动前端服务器
```bash
# 启动Vue开发服务器
npm run dev
```
前端将在 `http://localhost:5173` 运行

#### 启动后端服务器
```bash
# 启动Cloudflare Pages本地开发服务器
npm run dev:backend
```
后端将在 `http://127.0.0.1:8788` 运行

**注意**：确保 `wrangler.toml` 包含正确的D1和KV配置：
```toml
[[d1_databases]]
binding = "DB"
database_name = "prosub-db"
database_id = "你的数据库UUID"

[[kv_namespaces]]
binding = "KV"
id = "local"
preview_id = "local"
```

### 3. 验证服务状态

```bash
# 检查后端服务是否运行
netstat -ano | findstr :8788

# 检查前端服务是否运行
netstat -ano | findstr :5173
```

## 🧪 测试流程

### 1. 数据库连接测试

访问数据库测试端点：
```
http://127.0.0.1:8788/api/test-db
```

**预期结果**：
- ✅ 数据库连接成功
- ✅ 所有表结构正确
- ✅ 默认用户已创建
- ✅ 测试数据创建和清理成功

### 2. KV存储测试

访问KV测试端点：
```
http://127.0.0.1:8788/api/test-kv
```

**预期结果**：
- ✅ KV写入成功
- ✅ KV读取成功
- ✅ 会话存储正常

### 3. 前端应用测试

访问前端应用：
```
http://localhost:5173
```

**测试步骤**：
1. **登录测试**
   - 用户名：`admin`
   - 密码：`admin123`
   - 预期：成功登录并跳转到仪表盘

2. **节点管理测试**
   - 点击"导入节点"
   - 粘贴测试节点链接
   - 预期：成功导入并显示节点列表

3. **订阅管理测试**
   - 点击"添加订阅"
   - 输入测试订阅信息
   - 预期：成功添加订阅

### 4. API接口测试

#### 认证接口
```bash
# 登录测试
curl -X POST http://127.0.0.1:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 获取用户信息
curl -X GET http://127.0.0.1:8788/api/auth/me \
  -H "Cookie: session=your-session-token"
```

#### 节点管理接口
```bash
# 获取所有节点
curl -X GET http://127.0.0.1:8788/api/nodes

# 批量导入节点
curl -X POST http://127.0.0.1:8788/api/nodes/batch-import \
  -H "Content-Type: application/json" \
  -d '{"nodes":["vmess://test-node"]}'
```

#### 订阅管理接口
```bash
# 获取所有订阅
curl -X GET http://127.0.0.1:8788/api/subscriptions

# 创建订阅
curl -X POST http://127.0.0.1:8788/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{"name":"测试订阅","url":"https://example.com/sub"}'
```

## 🔧 故障排除

### 常见问题

#### 1. 后端服务启动失败
```bash
# 错误：Invalid database UUID
# 解决：检查wrangler.toml中的database_id是否正确
npx wrangler d1 list
# 使用实际的UUID更新wrangler.toml
```

#### 2. 数据库连接失败
```bash
# 错误：D1_ERROR: no such table
# 解决：初始化数据库
curl http://127.0.0.1:8788/api/test-db
```

#### 3. 前端无法连接后端
```bash
# 检查CORS配置
# 检查API基础URL配置
# 检查网络连接
```

#### 4. 端口被占用
```bash
# 查找占用端口的进程
netstat -ano | findstr :8788
netstat -ano | findstr :5173

# 终止进程
taskkill /PID <进程ID> /F
```

### 调试命令

```bash
# 查看后端日志
npm run dev:backend

# 查看前端日志
npm run dev

# 检查数据库状态
npx wrangler d1 execute prosub-db --local --command="SELECT name FROM sqlite_master WHERE type='table';"

# 检查本地D1数据库
npx wrangler d1 list
```

## 📊 测试数据

### 测试节点链接
```
vmess://eyJhZGQiOiJ0ZXN0LmV4YW1wbGUuY29tIiwiYWlkIjoiMCIsImhvc3QiOiIiLCJpZCI6IjEyMzQ1Njc4LTEyMzQtMTIzNC0xMjM0LTEyMzQ1Njc4OTBhYiIsIm5ldCI6IndzIiwicGF0aCI6Ii8iLCJwb3J0IjoiNDQzIiwicHJvdG9jb2wiOiJ2bWVzcyIsInRscyI6InRscyIsInR5cGUiOiJub25lIiwidiI6IjIifQ==
```

### 测试订阅URL
```
https://example.com/subscription
```

## 🎯 测试检查清单

### 基础功能测试
- [ ] 数据库连接正常
- [ ] 用户登录功能正常
- [ ] 节点导入功能正常
- [ ] 订阅管理功能正常
- [ ] 健康检查功能正常

### 界面功能测试
- [ ] 响应式设计正常
- [ ] 深色模式切换正常
- [ ] 导航菜单正常
- [ ] 表格筛选正常
- [ ] 批量操作正常

### 性能测试
- [ ] 页面加载速度 < 3秒
- [ ] API响应时间 < 1秒
- [ ] 大数据量处理正常
- [ ] 内存使用正常

## 🚀 部署前检查

在部署到生产环境前，请确保：

1. **本地测试全部通过**
2. **删除wrangler.toml文件**
3. **提交代码到GitHub**
4. **在Cloudflare Dashboard中配置绑定**

```bash
# 部署前准备
rm wrangler.toml
git add .
git commit -m "feat: ready for deployment"
git push origin main
```

## 📝 测试报告模板

```
测试环境：本地开发
测试时间：YYYY-MM-DD HH:MM:SS
测试人员：[姓名]

✅ 通过的功能：
- 数据库连接
- 用户认证
- 节点管理
- 订阅管理

❌ 失败的功能：
- [功能名称]：[错误描述]

🔧 需要修复的问题：
- [问题描述]

📊 性能指标：
- 页面加载时间：[时间]
- API响应时间：[时间]
- 内存使用：[使用量]
```

---

**提示**：如果遇到问题，请查看 [故障排除指南](TROUBLESHOOTING.md) 或创建 Issue。 