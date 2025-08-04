# ProSub 部署指南

## 🚀 全新部署到 Cloudflare

### 🎯 部署概述

本指南将帮助您将 ProSub 项目全新部署到 Cloudflare，使用 D1 数据库和 Cloudflare Pages。

### 📋 部署步骤

#### 1. 准备项目

确保您的项目已经准备好部署：

```bash
# 克隆项目（如果还没有）
git clone https://github.com/your-username/prosub.git
cd prosub

# 安装依赖
npm install

# 构建项目
npm run build
```

#### 2. 在 Cloudflare Dashboard 创建 D1 数据库

1. **登录 Cloudflare Dashboard**
   - 访问 [https://dash.cloudflare.com](https://dash.cloudflare.com)
   - 选择您的账户

2. **创建 D1 数据库**
   - 在左侧菜单找到 **Workers & Pages**
   - 点击 **D1** 标签
   - 点击 **Create database**
   - 数据库名称：`prosub-db`
   - 选择区域（建议选择离您最近的区域）
   - 点击 **Create**

3. **记录数据库信息**
   - 复制数据库 ID（形如：`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`）
   - 更新 `wrangler.toml` 中的 `database_id`

#### 3. 在 Cloudflare Dashboard 创建 Pages 项目

1. **创建 Pages 项目**
   - 在 Cloudflare Dashboard 中找到 **Workers & Pages**
   - 点击 **Pages** 标签
   - 点击 **Create a project**
   - 选择 **Connect to Git**

2. **连接 Git 仓库**
   - 选择您的 GitHub 账户
   - 选择 `prosub` 仓库
   - 点击 **Begin setup**

3. **配置构建设置**
   ```
   项目名称: prosub
   生产分支: main
   框架预设: None
   构建命令: npm run build
   构建输出目录: dist
   根目录: / (留空)
   ```

4. **环境变量设置**
   - 在 **Environment variables** 部分添加：
   ```
   NODE_ENV=production
   ```

#### 4. 配置 D1 数据库绑定

1. **在 Pages 项目中绑定 D1**
   - 在项目设置中找到 **Settings** → **Bindings**
   - 点击 **+ 添加**
   - **类型**: 选择 **D1 Database**
   - **变量名**: `DB`
   - **D1数据库**: 选择刚创建的 `prosub-db`
   - 点击 **Save**

#### 5. 初始化数据库结构

1. **使用 Cloudflare Dashboard 执行 SQL**
   - 在 D1 数据库页面点击 **Query** 标签
   - 复制 `schema.sql` 文件内容
   - 粘贴到查询编辑器
   - 点击 **Run** 执行

2. **验证表创建**
   ```sql
   SELECT name FROM sqlite_master WHERE type='table';
   ```

#### 6. 部署应用

1. **触发部署**
   - 在 Pages 项目页面点击 **Deployments**
   - 点击 **Redeploy** 或推送代码到 main 分支

2. **等待部署完成**
   - 查看部署日志确保没有错误
   - 部署完成后会显示访问链接

#### 7. 配置自定义域名（可选）

1. **添加自定义域名**
   - 在 Pages 项目设置中找到 **Custom domains**
   - 点击 **Set up a custom domain**
   - 输入您的域名
   - 按照提示配置 DNS 记录

### 🗄️ 数据库结构

#### 核心表

| 表名 | 描述 | 主要字段 |
|------|------|----------|
| `users` | 用户表 | id, username, password, role |
| `nodes` | 节点表 | id, name, server, port, type |
| `node_health_status` | 节点健康状态 | node_id, status, latency |
| `subscriptions` | 订阅表 | id, name, url, node_count |
| `profiles` | 配置文件表 | id, name, client_type |
| `traffic_records` | 流量统计 | profile_id, alias, bytes |

#### 关联表

| 表名 | 描述 | 关联关系 |
|------|------|----------|
| `profile_nodes` | 配置文件-节点关联 | profile_id ↔ node_id |
| `profile_subscriptions` | 配置文件-订阅关联 | profile_id ↔ subscription_id |
| `subscription_rules` | 订阅规则 | profile_id → rules |
| `node_group_members` | 节点组成员 | group_id ↔ node_id |

### 🛠️ 开发环境设置

#### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 启动后端服务（需要配置本地 D1）
npm run dev:backend
```

#### 本地 D1 数据库（开发用）

```bash
# 创建本地 D1 数据库
npx wrangler d1 create prosub-db --local

# 初始化数据库结构
npm run init-db

# 查看数据库表
npx wrangler d1 execute prosub-db --local --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### 📊 性能优化

#### 索引策略

- `idx_nodes_type`: 按节点类型查询
- `idx_nodes_server`: 按服务器地址查询
- `idx_node_health_status`: 按健康状态查询
- `idx_subscriptions_url`: 按订阅URL查询

#### 查询优化

```sql
-- 使用索引的查询示例
SELECT * FROM nodes WHERE type = 'vmess' ORDER BY created_at DESC;
SELECT * FROM node_health_status WHERE status = 'online';
```

### 🔒 安全考虑

#### 数据保护

- 密码使用明文存储（生产环境建议加密）
- 会话数据存储在 KV 中，24小时过期
- 数据库连接使用 Cloudflare 的安全通道

#### 访问控制

- 所有 API 端点都需要认证
- 用户角色系统支持权限控制
- SQL 注入防护使用参数化查询

### 🚨 故障排除

#### 常见问题

1. **数据库连接失败**
   - 检查 D1 数据库绑定是否正确
   - 确认数据库 ID 在 `wrangler.toml` 中正确配置

2. **表不存在**
   - 在 Cloudflare Dashboard 中重新执行 `schema.sql`