# 🚀 简化部署指南

## ✨ 最新优化

- **智能配置管理**：本地开发使用`wrangler.toml`，部署时自动删除避免冲突
- **纯Dashboard部署**：所有配置都在Cloudflare Dashboard中完成
- **零命令行操作**：完全通过Web界面部署

## 📋 部署步骤

### 1. 准备项目
```bash
# 克隆项目
git clone https://github.com/your-username/prosub.git
cd prosub

# 安装依赖
npm install

# 删除wrangler.toml以避免部署冲突
rm -f wrangler.toml

# 构建项目
npm run build
```

### 2. 创建Cloudflare Pages项目
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Pages** 页面
3. 点击 **Create a project**
4. 选择 **Connect to Git**
5. 选择你的GitHub仓库
6. 配置构建设置：
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (默认)

### 3. 创建D1数据库
1. 在Cloudflare Dashboard中进入 **Workers & Pages**
2. 点击 **D1** 标签
3. 点击 **Create database**
4. 输入数据库名称：`prosub-db`
5. 记录生成的数据库ID

### 4. 创建KV命名空间
1. 在Cloudflare Dashboard中进入 **Workers & Pages**
2. 点击 **KV** 标签
3. 点击 **Create a namespace**
4. 输入名称：`prosub-kv`
5. 记录生成的命名空间ID

### 5. 配置绑定
1. 在Pages项目详情页面
2. 点击 **Settings** 标签
3. 找到 **Functions** 部分
4. 点击 **Bindings** 配置
5. 添加以下绑定：

#### D1数据库绑定
- **Variable name**: `DB`
- **D1 database**: 选择刚创建的`prosub-db`

#### KV命名空间绑定
- **Variable name**: `KV`
- **KV namespace**: 选择刚创建的`prosub-kv`

### 6. 初始化数据库
1. 部署完成后，访问你的域名
2. 访问 `/api/test-db` 端点
3. 这将自动创建所有表和默认用户

### 7. 登录测试
- 默认用户名：`admin`
- 默认密码：`admin123`

## 🔧 本地开发

如果需要本地开发，使用专门的本地配置：

```bash
# 启动前端
npm run dev

# 启动后端（使用本地配置）
npm run dev:backend
```

本地开发使用 `wrangler.toml` 配置文件，部署时会自动删除以避免UUID冲突。

## 🎯 优势

1. **零配置冲突**：没有硬编码的UUID
2. **Dashboard友好**：所有配置都在Web界面完成
3. **Fork友好**：其他人fork后无需修改任何文件
4. **环境隔离**：本地开发和生产部署完全分离

## 🚨 注意事项

- 确保在绑定配置中正确设置变量名（`DB`和`KV`）
- 数据库初始化需要访问`/api/test-db`端点
- 本地开发使用`wrangler.toml`，部署前需要删除该文件以避免UUID冲突 