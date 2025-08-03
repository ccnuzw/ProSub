# ProSub 项目结构

## 📁 目录结构概览

```
prosub/
├── 📁 src/                    # 前端源码
│   ├── 📁 components/         # Vue组件
│   ├── 📁 views/             # 页面视图
│   ├── 📁 router/            # 路由配置
│   ├── 📁 utils/             # 工具函数
│   ├── 📁 assets/            # 静态资源
│   ├── App.vue               # 根组件
│   ├── main.ts               # 入口文件
│   └── globals.css           # 全局样式
├── 📁 functions/             # 后端源码 (Cloudflare Workers)
│   ├── 📁 api/               # API路由
│   ├── 📁 core/              # 核心业务逻辑
│   └── index.ts              # Worker入口
├── 📁 packages/              # 共享包
│   └── 📁 shared/            # 前后端共享代码
├── 📁 dist/                  # 构建输出
├── 📁 dev-dist/              # 开发构建输出
└── 📄 配置文件
```

## 🎯 前端结构 (src/)

### 📁 components/ - Vue组件
```
components/
├── ClientLayout.vue          # 主布局组件
├── NodeForm.vue             # 节点表单
├── NodeImportModal.vue      # 节点导入模态框
├── ProfileForm.vue          # 配置文件表单
├── ProfileStep1Basic.vue    # 配置文件步骤1
├── ProfileStep2Nodes.vue    # 配置文件步骤2
├── ProfileStep3Subscriptions.vue # 配置文件步骤3
├── ProfileStep4ClientRules.vue   # 配置文件步骤4
├── SubscriptionForm.vue      # 订阅表单
├── SubscriptionRuleModal.vue # 订阅规则模态框
├── UserForm.vue             # 用户表单
└── index.ts                 # 组件统一导出
```

### 📁 views/ - 页面视图
```
views/
├── Dashboard.vue            # 仪表板页面
├── Login.vue               # 登录页面
├── Nodes.vue               # 节点管理页面
├── Profiles.vue            # 配置文件页面
├── Subscriptions.vue       # 订阅管理页面
├── UserProfile.vue         # 用户资料页面
└── index.ts                # 视图统一导出
```

### 📁 utils/ - 工具函数
```
utils/
├── auth.ts                 # 认证相关工具
├── storage.ts              # 存储相关工具
├── format.ts               # 格式化工具
├── validation.ts           # 验证工具
└── index.ts                # 工具统一导出
```

### 📁 router/ - 路由配置
```
router/
└── index.ts                # 路由配置
```

### 📁 assets/ - 静态资源
```
assets/
├── logo-192.svg            # 应用图标
└── logo-512.svg            # 应用图标
```

## 🔧 后端结构 (functions/)

### 📁 api/ - API路由
```
api/
├── 📁 auth/                # 认证相关API
│   ├── login.ts
│   ├── logout.ts
│   └── me.ts
├── 📁 nodes/               # 节点管理API
│   ├── index.ts
│   ├── [id]/
│   │   └── index.ts
│   ├── batch-delete.ts
│   ├── batch-import.ts
│   └── clear-all.ts
├── 📁 subscriptions/        # 订阅管理API
│   ├── index.ts
│   ├── [id]/
│   │   ├── index.ts
│   │   └── update.ts
│   ├── preview/
│   │   └── [id].ts
│   ├── batch-import.ts
│   └── 📁 alias/
│       └── [alias].ts
├── 📁 profiles/            # 配置文件API
│   ├── index.ts
│   └── [id]/
│       └── index.ts
├── 📁 node-groups/         # 节点组API
│   ├── index.ts
│   └── [id]/
│       └── index.ts
├── 📁 rule-sets/           # 规则集API
│   ├── index.ts
│   └── [id]/
│       └── index.ts
├── 📁 users/               # 用户管理API
│   ├── index.ts
│   └── [id]/
│       └── index.ts
├── 📁 utility/             # 工具API
│   ├── stats.ts
│   ├── traffic.ts
│   ├── node-statuses.ts
│   ├── node-health-check.ts
│   └── subscription-statuses.ts
└── index.ts                # API路由索引
```

### 📁 core/ - 核心业务逻辑
```
core/
├── 📁 utils/               # 后端工具函数
│   ├── auth.ts             # 认证工具
│   ├── crypto.ts           # 加密工具
│   ├── response.ts         # 响应工具
│   ├── data-access.ts      # 数据访问层
│   └── subscription-parser.ts # 订阅解析工具
├── nodes.ts                # 节点业务逻辑
├── subscriptions.ts        # 订阅业务逻辑
├── subscriptions-update.ts # 订阅更新逻辑
├── subscriptions-preview.ts # 订阅预览逻辑
├── subscriptions-batch-import.ts # 批量导入逻辑
├── profiles.ts             # 配置文件业务逻辑
├── profiles-id.ts          # 配置文件ID操作
├── node-groups.ts          # 节点组业务逻辑
├── rule-sets.ts            # 规则集业务逻辑
├── users-id.ts             # 用户ID操作
├── subscribe.ts            # 订阅生成逻辑
├── stats.ts                # 统计业务逻辑
├── traffic.ts              # 流量业务逻辑
├── node-statuses.ts        # 节点状态业务逻辑
├── node-health-check.ts    # 健康检查业务逻辑
├── subscription-statuses.ts # 订阅状态业务逻辑
├── nodes-batch-delete.ts   # 批量删除节点
├── nodes-batch-import.ts   # 批量导入节点
├── nodes-clear-all.ts      # 清空所有节点
└── index.ts                # 核心逻辑索引
```

## 📦 共享包结构 (packages/)

### 📁 shared/ - 前后端共享代码
```
shared/
├── 📁 types/               # 类型定义
│   └── index.ts
├── 📁 rulesets/            # 规则集
│   ├── index.ts
│   ├── clash-default.ts
│   ├── clash-lite.ts
│   ├── surge-default.ts
│   ├── surge-lite.ts
│   ├── quantumult-x-default.ts
│   ├── quantumult-x-lite.ts
│   ├── loon-default.ts
│   ├── loon-lite.ts
│   ├── sing-box-default.ts
│   └── sing-box-lite.ts
├── node-parser.ts          # 节点解析器
├── clash-parser.ts         # Clash配置解析器
├── subscription-generator.ts # 订阅生成器
└── index.ts                # 共享包入口
```

## 🎨 设计系统

### 📄 DESIGN_SYSTEM.md
- 设计原则和规范
- 色彩系统
- 字体系统
- 组件设计
- 响应式断点

### 📄 globals.css
- CSS变量定义
- 全局样式
- 组件样式覆盖
- 动画效果

## 📚 文档

### 📄 README.md
- 项目介绍
- 技术栈
- 部署指南
- 使用说明

### 📄 FUTURE_FEATURES.md
- 未来功能规划
- 开发路线图

### 📄 BACKEND_OPTIMIZATION.md
- 后端优化总结
- 代码重构记录

### 📄 PROJECT_STRUCTURE.md
- 项目结构文档（本文件）

## 🔧 配置文件

### 📄 package.json
- 项目依赖
- 脚本命令
- 项目信息

### 📄 vite.config.ts
- Vite构建配置
- 插件配置

### 📄 tailwind.config.js
- Tailwind CSS配置

### 📄 tsconfig.json
- TypeScript配置

### 📄 wrangler.toml
- Cloudflare Workers配置

## 🚀 构建输出

### 📁 dist/
- 生产环境构建输出

### 📁 dev-dist/
- 开发环境构建输出
- Service Worker文件

## 📝 开发规范

### 文件命名
- 组件文件使用 PascalCase
- 工具文件使用 camelCase
- 常量文件使用 UPPER_SNAKE_CASE

### 目录组织
- 按功能模块分组
- 相关文件放在同一目录
- 使用索引文件统一导出

### 代码结构
- 单一职责原则
- 依赖注入
- 统一接口设计
- 错误处理标准化 