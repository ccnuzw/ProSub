# Cloudflare Dashboard 直接部署指南

## 🚀 简化部署流程

**5分钟快速部署，无需任何命令行操作！**

### ⚠️ 重要说明

**本项目已优化，fork用户无需手动编辑`wrangler.toml`文件！**

- ✅ **无需UUID配置**: `wrangler.toml`中的UUID已注释，避免冲突
- ✅ **纯Dashboard配置**: 所有资源绑定都在Cloudflare Dashboard中完成
- ✅ **零代码修改**: fork后可直接部署，无需任何文件编辑

### **步骤1: Fork项目**
1. 访问 [ProSub GitHub页面](https://github.com/imzyb/ProSub)
2. 点击右上角 **"Fork"** 按钮
3. 选择您的GitHub账户

### **步骤2: 创建Cloudflare资源**

#### **创建D1数据库**
1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击左侧 **Workers & Pages** → **D1**
3. 点击 **Create database**
4. 数据库名称: `prosub_db`
5. 点击 **Create database**

#### **创建KV命名空间**
1. 点击左侧 **Workers & Pages** → **KV**
2. 点击 **Create a namespace**
3. 命名空间名称: `prosub_kv`
4. 点击 **Add binding**

### **步骤3: 创建Pages项目**

1. 点击左侧 **Workers & Pages** → **Pages**
2. 点击 **Create a project** → **Connect to Git**
3. 选择 **GitHub** → 授权 → 选择您fork的仓库
4. 配置构建设置：
   - **项目名称**: `prosub`
   - **生产分支**: `main`
   - **框架预设**: `None`
   - **构建命令**: `npm run build`
   - **构建输出目录**: `dist`
5. 点击 **Save and Deploy**

### **步骤4: 配置环境变量**

在Pages项目创建完成后：

1. 点击您的Pages项目 → **Settings**
2. 找到 **Bindings** 部分 → 点击 **+ 添加**

#### **添加KV绑定**
- **类型**: 选择 **KV Namespace**
- **变量名**: `KV`
- **KV命名空间**: 选择 `prosub_kv`
- 点击 **Save**

#### **添加D1绑定**
- **类型**: 选择 **D1 Database**
- **变量名**: `DB`
- **D1数据库**: 选择 `prosub_db`
- 点击 **Save**

### **步骤5: 初始化数据库**

#### **方法A: 使用在线SQL编辑器（推荐）**

1. 进入您的D1数据库 → **Query**
2. 复制以下SQL并粘贴到查询编辑器：

```sql
-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 创建节点表
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
);

-- 创建节点健康状态表
CREATE TABLE IF NOT EXISTS node_health_status (
    node_id TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'unknown',
    latency INTEGER,
    last_checked TEXT NOT NULL,
    error TEXT,
    FOREIGN KEY (node_id) REFERENCES nodes (id) ON DELETE CASCADE
);

-- 创建订阅表
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    node_count INTEGER DEFAULT 0,
    last_updated TEXT,
    error TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 创建配置文件表
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    client_type TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 创建配置文件-节点关联表
CREATE TABLE IF NOT EXISTS profile_nodes (
    profile_id TEXT NOT NULL,
    node_id TEXT NOT NULL,
    PRIMARY KEY (profile_id, node_id),
    FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
    FOREIGN KEY (node_id) REFERENCES nodes (id) ON DELETE CASCADE
);

-- 创建配置文件-订阅关联表
CREATE TABLE IF NOT EXISTS profile_subscriptions (
    profile_id TEXT NOT NULL,
    subscription_id TEXT NOT NULL,
    PRIMARY KEY (profile_id, subscription_id),
    FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE CASCADE
);

-- 创建订阅规则表
CREATE TABLE IF NOT EXISTS subscription_rules (
    id TEXT PRIMARY KEY,
    subscription_id TEXT NOT NULL,
    rule_type TEXT NOT NULL,
    rule_content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE CASCADE
);

-- 创建节点组表
CREATE TABLE IF NOT EXISTS node_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 创建节点组成员表
CREATE TABLE IF NOT EXISTS node_group_members (
    group_id TEXT NOT NULL,
    node_id TEXT NOT NULL,
    PRIMARY KEY (group_id, node_id),
    FOREIGN KEY (group_id) REFERENCES node_groups (id) ON DELETE CASCADE,
    FOREIGN KEY (node_id) REFERENCES nodes (id) ON DELETE CASCADE
);

-- 创建流量记录表
CREATE TABLE IF NOT EXISTS traffic_records (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    alias TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes (type);
CREATE INDEX IF NOT EXISTS idx_nodes_server ON nodes (server);
CREATE INDEX IF NOT EXISTS idx_subscriptions_url ON subscriptions (url);
CREATE INDEX IF NOT EXISTS idx_profiles_client_type ON profiles (client_type);
CREATE INDEX IF NOT EXISTS idx_traffic_records_timestamp ON traffic_records (timestamp);
```

3. 点击 **Run**

4. 创建默认用户，执行：

```sql
INSERT INTO users (id, username, password, role, created_at, updated_at) 
VALUES ('admin', 'admin', 'admin123', 'admin', datetime('now'), datetime('now'));
```

#### **方法B: 使用Wrangler CLI（一次性操作）**

```bash
# 安装并登录Wrangler
npm install -g wrangler
npx wrangler login

# 初始化数据库
npx wrangler d1 execute prosub-db --remote --file=schema.sql
npx wrangler d1 execute prosub-db --remote --command="INSERT INTO users (id, username, password, role, created_at, updated_at) VALUES ('admin', 'admin', 'admin123', 'admin', datetime('now'), datetime('now'));"
```

### **步骤6: 验证部署**

1. **访问您的Pages域名**
   - 在Pages项目页面找到您的域名
   - 例如：`https://prosub.pages.dev`

2. **使用默认凭据登录**
   - **用户名**: `admin`
   - **密码**: `admin123`

## 🔧 常见问题

### **Q: 部署失败怎么办？**
- 检查构建设置是否正确
- 确认环境变量已配置
- 查看部署日志中的错误信息

### **Q: 登录失败怎么办？**
- 确认数据库已初始化
- 检查默认用户是否已创建
- 验证环境变量绑定是否正确

### **Q: 如何查看部署状态？**
- 在Pages项目中点击 **Deployments** 标签页
- 查看最新的部署记录和日志

## 🎉 完成！

**恭喜！您已经成功部署了自己的ProSub实例！**

### **后续维护**
- **监控部署**: 在Pages项目中查看部署状态
- **管理数据**: 在D1数据库中管理数据
- **更新代码**: 在GitHub中同步原项目更新

### **优势**
- ✅ **5分钟快速部署**
- ✅ **无需本地环境**
- ✅ **图形化操作**
- ✅ **自动部署更新** 