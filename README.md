# ProSub - 专业的代理节点管理平台

[![Deploy to Cloudflare](https://img.shields.io/badge/Deploy%20to-Cloudflare%20Pages-blue?logo=cloudflare)](https://dash.cloudflare.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Vue](https://img.shields.io/badge/Vue-3.4+-green.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

> 🚀 基于 Vue 3 + Cloudflare Workers + D1 数据库构建的现代化代理节点管理平台

## ✨ 核心功能

### 🔧 节点管理
- **批量导入**：支持多种协议节点批量导入
- **健康检查**：实时监控节点状态和延迟
- **智能筛选**：按类型、状态、地区筛选节点
- **批量操作**：支持批量删除、导出操作

### 📡 订阅管理
- **订阅源管理**：添加、编辑、删除订阅源
- **自动更新**：定时更新订阅内容
- **节点解析**：自动解析订阅中的节点信息
- **状态监控**：监控订阅更新状态

### 📋 配置文件
- **多客户端支持**：Clash、Surge、Quantumult X、Loon、Sing-Box
- **规则管理**：自定义包含/排除规则
- **节点选择**：灵活选择节点和订阅
- **实时生成**：动态生成配置文件

### 📊 数据统计
- **实时监控**：节点在线率、延迟统计
- **流量分析**：使用量统计和分析
- **性能优化**：基于数据的节点优化建议

## 🏗️ 技术架构

### 前端技术栈
```
Vue 3 (Composition API)
├── Vite (构建工具)
├── TypeScript (类型安全)
├── Ant Design Vue (UI组件)
├── Vue Router (路由管理)
└── Pinia (状态管理)
```

### 后端技术栈
```
Cloudflare Workers (Edge Runtime)
├── D1 Database (SQLite数据库)
├── KV Storage (会话存储)
├── TypeScript (类型安全)
└── RESTful API (接口设计)
```

### 数据存储
```
D1 Database (主数据库)
├── users (用户表)
├── nodes (节点表)
├── subscriptions (订阅表)
├── profiles (配置文件表)
└── node_health_status (健康状态表)

KV Storage (缓存存储)
├── session (会话数据)
└── cache (临时缓存)
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Cloudflare 账户

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/your-username/prosub.git
cd prosub

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 启动后端服务（需要配置本地 D1）
npm run dev:backend
```

### 生产部署

详细部署指南请参考：[📖 部署指南](DEPLOYMENT_GUIDE.md)

#### 快速部署步骤：

1. **准备项目**
   ```bash
   npm install
   npm run build
   ```

2. **在 Cloudflare Dashboard 创建资源**
   - 创建 D1 数据库
   - 创建 Pages 项目
   - 配置数据库绑定

3. **初始化数据库**
   - 在 D1 数据库中执行 `schema.sql`

4. **部署应用**
   - 推送代码到 main 分支
   - 自动触发部署

### 🍴 Fork 部署

如果您想部署自己的实例，请参考：[📖 Fork部署指南](FORK_DEPLOYMENT_GUIDE.md)

#### 快速Fork步骤：

1. **Fork项目**
   - 点击GitHub页面右上角的"Fork"按钮
   - 选择您的GitHub账户

2. **克隆到本地**
   ```bash
   git clone https://github.com/你的用户名/ProSub.git
   cd ProSub
   ```

3. **创建Cloudflare资源**
   ```bash
   # 创建D1数据库
   npx wrangler d1 create prosub-db
   
   # 创建KV命名空间
   npx wrangler kv namespace create "PROSUB_KV"
   ```

4. **更新配置文件**
   - 编辑 `wrangler.toml`，替换为您自己的UUID

5. **初始化数据库**
   ```bash
   npx wrangler d1 execute prosub-db --remote --file=schema.sql
   npx wrangler d1 execute prosub-db --remote --command="INSERT INTO users (id, username, password, role, created_at, updated_at) VALUES ('admin', 'admin', 'admin123', 'admin', datetime('now'), datetime('now'));"
   ```

6. **部署到Cloudflare Pages**
   - 连接GitHub仓库
   - 配置环境变量绑定

### 🖥️ Dashboard 直接部署

**5分钟快速部署，无需任何命令行操作！**

详细指南请参考：[📖 Dashboard部署指南](DASHBOARD_DEPLOYMENT_GUIDE.md)

#### 超简单步骤：

1. **Fork项目** → 在GitHub中fork原项目
2. **创建资源** → 在Dashboard中创建D1数据库和KV命名空间
3. **创建Pages** → 连接GitHub仓库，配置构建设置
4. **配置绑定** → 在Settings的Bindings部分添加D1和KV绑定
5. **初始化DB** → 使用在线SQL编辑器执行数据库初始化
6. **验证部署** → 访问域名，使用默认凭据登录

**优势**：
- ✅ **5分钟快速部署**
- ✅ **无需本地环境**
- ✅ **图形化操作**
- ✅ **自动部署更新**

## 📖 使用指南

### 首次登录
- **用户名**：`admin`
- **密码**：`admin123`
- **建议**：首次登录后立即修改密码

### 节点管理
1. **导入节点**：点击"导入节点"按钮
2. **批量导入**：粘贴节点链接或配置文件
3. **健康检查**：点击"检查所有节点"
4. **筛选节点**：使用搜索和筛选功能

### 订阅管理
1. **添加订阅**：输入订阅名称和URL
2. **更新订阅**：点击"更新"按钮
3. **查看状态**：监控订阅更新状态

### 配置文件
1. **创建配置**：选择客户端类型
2. **选择节点**：添加节点和订阅
3. **设置规则**：配置包含/排除规则
4. **生成配置**：下载配置文件

## 🔧 开发指南

### 项目结构
```
prosub/
├── src/                    # 前端源码
│   ├── components/        # Vue组件
│   ├── views/            # 页面组件
│   ├── router/           # 路由配置
│   └── lib/              # 工具库
├── functions/             # 后端API
│   ├── api/              # API路由
│   ├── core/             # 核心逻辑
│   └── utils/            # 工具函数
├── packages/              # 共享包
│   └── shared/           # 共享类型和工具
└── docs/                 # 文档
```

### 开发命令
```bash
# 开发服务器
npm run dev

# 后端开发
npm run dev:backend

# 构建项目
npm run build

# 类型检查
npm run type-check

# 代码格式化
npm run format

# 代码检查
npm run lint
```

### 数据库操作
```bash
# 初始化数据库
npm run init-db

# 本地数据库迁移
npm run db:migrate

# 生产数据库迁移
npm run db:migrate:prod
```

## 📊 性能特性

### 前端优化
- ✅ **代码分割**：按路由懒加载
- ✅ **Tree Shaking**：移除未使用代码
- ✅ **缓存策略**：静态资源缓存
- ✅ **PWA支持**：离线访问能力

### 后端优化
- ✅ **Edge Computing**：全球边缘计算
- ✅ **数据库索引**：查询性能优化
- ✅ **连接池**：数据库连接复用
- ✅ **缓存机制**：减少数据库查询

### 监控指标
- **响应时间**：< 100ms (边缘计算)
- **可用性**：99.9%+ (Cloudflare 基础设施)
- **并发处理**：支持高并发请求
- **数据一致性**：ACID 事务支持

## 🔒 安全特性

### 认证授权
- ✅ **会话管理**：安全的会话存储
- ✅ **密码加密**：生产环境建议加密
- ✅ **访问控制**：基于角色的权限控制
- ✅ **API保护**：所有接口需要认证

### 数据安全
- ✅ **SQL注入防护**：参数化查询
- ✅ **XSS防护**：输入验证和转义
- ✅ **CSRF防护**：Token验证
- ✅ **HTTPS强制**：全站HTTPS

## 🤝 贡献指南

### 开发流程
1. **Fork 项目**
2. **创建特性分支**：`git checkout -b feature/xxx`
3. **提交更改**：`git commit -m 'feat: add xxx'`
4. **推送分支**：`git push origin feature/xxx`
5. **创建 Pull Request**

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 使用 Prettier 格式化代码
- 编写单元测试

### 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式化
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Ant Design Vue](https://antdv.com/) - 企业级UI组件库
- [Cloudflare Workers](https://workers.cloudflare.com/) - 边缘计算平台
- [Cloudflare D1](https://developers.cloudflare.com/d1/) - 边缘数据库

## 📞 支持

如果您在使用过程中遇到问题，请：

1. 查看 [部署指南](DEPLOYMENT_GUIDE.md)
2. 搜索 [Issues](https://github.com/your-username/prosub/issues)
3. 创建新的 Issue 描述问题

---

⭐ 如果这个项目对您有帮助，请给我们一个 Star！