# 故障排除指南

## 🔧 Dashboard绑定问题

### **问题描述**
Dashboard中的"绑定"界面显示"此项目的绑定在通过 wrangler.toml 进行管理"，无法手动添加绑定。

### **可能原因**
1. `wrangler.toml`文件仍然存在绑定配置
2. Cloudflare Pages缓存了旧的配置
3. 项目创建时使用了旧的配置

### **解决方案**

#### **方案1: 重新创建Pages项目**
1. 删除现有的Pages项目
2. 重新创建Pages项目
3. 连接GitHub仓库
4. 检查绑定界面是否可用

#### **方案2: 检查wrangler.toml文件**
确保`wrangler.toml`文件中没有以下内容：
```toml
[[kv_namespaces]]
[[d1_databases]]
```

#### **方案3: 使用环境变量**
如果绑定界面仍然不可用，可以尝试：
1. 在Pages项目设置中添加环境变量
2. 变量名：`KV_BINDING`，值：您的KV命名空间ID
3. 变量名：`DB_BINDING`，值：您的D1数据库ID

#### **方案4: 联系Cloudflare支持**
如果以上方案都不行，请联系Cloudflare支持获取帮助。

## 🗄️ 数据库初始化问题

### **问题描述**
创建默认用户失败，出现SQL错误。

### **常见错误和解决方案**

#### **错误1: 表不存在**
```sql
-- 检查表是否存在
SELECT name FROM sqlite_master WHERE type='table' AND name='users';

-- 如果不存在，重新创建
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

#### **错误2: 唯一约束冲突**
```sql
-- 检查是否已存在admin用户
SELECT * FROM users WHERE username='admin';

-- 如果存在，先删除再创建
DELETE FROM users WHERE username='admin';
INSERT INTO users (id, username, password, role, created_at, updated_at) 
VALUES ('admin', 'admin', 'admin123', 'admin', datetime('now'), datetime('now'));
```

#### **错误3: 外键约束错误**
```sql
-- 检查表结构
PRAGMA table_info(users);

-- 如果结构不正确，重新创建
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

#### **错误4: 语法错误**
确保SQL语句格式正确：
```sql
-- 正确的语法
INSERT INTO users (id, username, password, role, created_at, updated_at) 
VALUES ('admin', 'admin', 'admin123', 'admin', datetime('now'), datetime('now'));
```

### **完整的诊断流程**

1. **检查数据库连接**
```sql
SELECT 1;
```

2. **检查所有表**
```sql
SELECT name FROM sqlite_master WHERE type='table';
```

3. **检查users表结构**
```sql
PRAGMA table_info(users);
```

4. **检查现有用户**
```sql
SELECT * FROM users;
```

5. **创建用户（如果表为空）**
```sql
INSERT INTO users (id, username, password, role, created_at, updated_at) 
VALUES ('admin', 'admin', 'admin123', 'admin', datetime('now'), datetime('now'));
```

6. **验证用户创建**
```sql
SELECT * FROM users WHERE username='admin';
```

### **使用API测试数据库**

如果上述SQL测试正常，但API仍然失败，可以访问以下URL进行API测试：

```
https://your-domain.pages.dev/api/test-db
```

这个测试会：
- ✅ 验证数据库连接
- ✅ 检查表结构
- ✅ 测试创建订阅
- ✅ 测试创建节点
- ✅ 显示详细的错误信息

### **常见API错误**

#### **错误1: 字段名不匹配**
```
Error: no such column: nodeCount
```
**解决方案**: 确保数据库表使用下划线格式的字段名（如`node_count`）

#### **错误2: 表不存在**
```
Error: no such table: subscriptions
```
**解决方案**: 重新执行schema.sql创建表

#### **错误3: 外键约束失败**
```
Error: FOREIGN KEY constraint failed
```
**解决方案**: 检查关联表是否存在，确保数据完整性

#### **错误4: 认证失败**
```
Error: 401 Unauthorized
```
**解决方案**: 确保已登录，检查session是否有效

## 🚀 替代部署方案

### **使用Wrangler CLI部署**
如果Dashboard绑定有问题，可以使用命令行部署：

```bash
# 1. 安装Wrangler
npm install -g wrangler

# 2. 登录
npx wrangler login

# 3. 创建本地配置文件
cp wrangler.local.toml.example wrangler.local.toml
# 编辑 wrangler.local.toml，填入您的UUID

# 4. 构建项目
npm run build

# 5. 部署
npx wrangler pages deploy dist --project-name=your-project-name
```

### **使用GitHub Actions自动部署**
创建`.github/workflows/deploy.yml`文件：

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: your-project-name
          directory: dist
```

## 📝 常见问题

### **Q: 为什么Dashboard绑定界面被禁用？**
A: 这通常是因为`wrangler.toml`文件中存在绑定配置。我们已经移除了这些配置，但可能需要重新创建项目。

### **Q: 如何获取UUID？**
A: 使用以下命令：
```bash
# 查看D1数据库
npx wrangler d1 list

# 查看KV命名空间
npx wrangler kv namespace list
```

### **Q: 部署失败怎么办？**
A: 检查以下几点：
1. UUID是否正确
2. 资源是否已创建
3. 权限是否足够

### **Q: 本地开发怎么办？**
A: 使用本地配置文件：
```bash
# 复制模板文件
cp wrangler.local.toml.example wrangler.local.toml

# 编辑配置文件，填入您的UUID

# 本地开发
npm run dev:backend -- --local
```

## 🎯 最佳实践

1. **首次部署**: 建议使用Dashboard方式，更直观
2. **后续维护**: 可以使用CLI方式，更灵活
3. **团队协作**: 使用GitHub Actions自动部署
4. **故障排除**: 先检查配置文件，再联系支持

---

**如果问题仍然存在，请提供详细的错误信息，我们会继续帮助您解决！** 🔧 