---
title: Project Structure
description: "Defines the project's directory structure and file organization."
inclusion: always
---

# ProSub 项目结构

## 总体目录结构

```
prosub/
├── .ai-rules/                 # AI代理指导文件
├── .github/                   # GitHub相关配置
│   └── workflows/             # CI/CD工作流配置
├── .vscode/                   # VS Code配置文件
├── dist/                      # 构建输出目录
├── docs/                      # 项目文档
├── functions/                 # 后端API（Cloudflare Workers）
│   ├── api/                   # API路由
│   ├── core/                  # 核心业务逻辑
│   └── utils/                 # 工具函数
├── packages/                  # 共享包
│   └── shared/                # 共享类型和工具
├── public/                    # 静态资源文件
├── src/                       # 前端源代码
│   ├── assets/                # 静态资源
│   ├── components/            # Vue组件
│   ├── composables/           # Vue组合式函数
│   ├── layouts/               # 页面布局组件
│   ├── lib/                   # 工具库
│   ├── router/                # 路由配置
│   ├── stores/                # 状态管理
│   ├── styles/                # 样式文件
│   ├── views/                 # 页面组件
│   └── App.vue                # 根组件
├── tests/                     # 测试文件
│   ├── e2e/                   # 端到端测试
│   └── unit/                  # 单元测试
├── .env                       # 环境变量文件
├── .env.example               # 环境变量示例文件
├── .eslintrc.js               # ESLint配置
├── .gitignore                 # Git忽略文件配置
├── .prettierrc                # Prettier配置
├── CLAUDE.md                  # Claude AI助手指导文件
├── DASHBOARD_DEPLOYMENT_GUIDE.md  # 仪表板部署指南
├── LOCAL_TESTING_GUIDE.md     # 本地测试指南
├── README.md                  # 项目说明文档
├── index.html                 # HTML入口文件
├── package.json               # 项目配置和依赖
├── schema.sql                 # 数据库模式定义
├── tsconfig.json              # TypeScript配置
├── tsconfig.node.json         # Node.js TypeScript配置
├── vite.config.ts             # Vite构建配置
└── vitest.config.ts           # Vitest测试配置
```

## 前端结构详解 (src/)

### 组件 (src/components/)
- 可复用的UI组件
- 每个组件应有清晰的职责和接口
- 组件命名采用 PascalCase

### 页面 (src/views/)
- 完整的页面组件
- 对应路由配置中的页面
- 命名采用 PascalCase

### 路由 (src/router/)
- 路由配置文件
- 定义应用的所有路由路径和对应的组件

### 状态管理 (src/stores/)
- 使用 Pinia 进行状态管理
- 每个 store 模块负责特定功能的状态管理

### 组合式函数 (src/composables/)
- 可复用的逻辑函数
- 遵循 Vue 3 Composition API 模式

### 工具库 (src/lib/)
- 通用工具函数
- 与业务逻辑相关的辅助函数

### 样式 (src/styles/)
- 全局样式文件
- CSS 变量定义
- 主题相关样式

## 后端结构详解 (functions/)

### API路由 (functions/api/)
- 定义所有API端点
- 每个路由文件对应一个特定的API路径
- 使用 Cloudflare Workers 的文件路由系统

### 核心业务逻辑 (functions/core/)
- 包含主要的业务逻辑实现
- 按功能模块组织（如 auth、nodes、subscriptions 等）
- 处理数据访问和业务规则

### 工具函数 (functions/utils/)
- 通用工具函数
- 响应处理、认证、数据访问等辅助功能

## 共享包结构 (packages/shared/)

### 类型定义 (packages/shared/types/)
- 在前后端之间共享的 TypeScript 类型
- 数据库模型定义
- API 响应类型定义

### 工具函数 (packages/shared/utils/)
- 可在前后端共享的工具函数
- 订阅解析和生成逻辑
- 节点解析相关函数

## 数据库结构

### 模式定义 (schema.sql)
- 定义数据库表结构
- 包含所有表的创建语句
- 索引和外键约束定义

## 测试结构 (tests/)

### 单元测试 (tests/unit/)
- 针对独立函数和组件的测试
- 使用 Vitest 进行测试

### 端到端测试 (tests/e2e/)
- 模拟用户行为的完整流程测试
- 使用 Playwright 或 Cypress

## 配置文件

### 构建配置 (vite.config.ts)
- Vite 构建工具配置
- 插件配置和构建选项

### 类型检查 (tsconfig.json)
- TypeScript 编译配置
- 包含路径映射和编译选项

### 代码质量 (eslintrc.js, prettierrc)
- 代码规范和格式化规则
- 确保代码风格一致性

## 文档文件

### 指导文档
- README.md: 项目概述和快速开始指南
- CLAUDE.md: 为AI助手提供的项目指导
- 部署和测试指南文档

### AI规则文件 (.ai-rules/)
- 为AI代理提供的指导文件
- 包含产品愿景、技术栈和项目结构等核心信息

## 命名规范

### 文件命名
- 组件文件: PascalCase (例如: NodeTable.vue)
- 其他文件: kebab-case (例如: node-health-check.ts)

### 目录命名
- 所有目录使用 kebab-case 命名规范

### 变量和函数命名
- JavaScript/TypeScript: camelCase
- 类型和接口: PascalCase

## 代码组织原则

1. **功能相关性**：相关功能的文件应放在同一目录下
2. **职责分离**：前后端代码分离，业务逻辑与API路由分离
3. **可维护性**：清晰的目录结构便于新成员快速上手
4. **可扩展性**：结构设计支持功能模块的轻松添加