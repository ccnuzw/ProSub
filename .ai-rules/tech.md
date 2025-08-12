---
title: Technology Stack
description: "Defines the project's technology stack, frameworks, and tools."
inclusion: always
---

# ProSub 技术栈

## 前端技术栈

### 核心框架
- **Vue 3**：采用 Composition API 的现代前端框架
- **TypeScript**：提供类型安全的开发体验
- **Vite**：快速的开发构建工具

### UI 组件库
- **Ant Design Vue**：企业级 UI 设计语言和 React 组件库的 Vue 实现

### 状态管理
- **Pinia**：Vue 3 官方推荐的状态管理库

### 路由管理
- **Vue Router**：Vue.js 官方路由管理器

### 构建和开发工具
- **ESLint**：代码规范检查工具
- **Prettier**：代码格式化工具
- **Vitest**：单元测试框架

## 后端技术栈

### 运行环境
- **Cloudflare Workers**：边缘计算平台，提供全球分布式服务器
- **Cloudflare D1 Database**：基于 SQLite 的边缘数据库

### 数据存储
- **D1 Database**：关系型数据库，用于持久化存储节点、订阅等数据
- **KV Storage**：键值存储，用于缓存和会话管理

### API 设计
- **RESTful API**：遵循 REST 设计原则的 API 接口

## 共享包和工具

### 类型定义
- **Shared Types**：在前端和后端之间共享的 TypeScript 类型定义

### 工具库
- **js-yaml**：YAML 解析和生成库
- **uuid**：UUID 生成库

## 开发环境要求

### Node.js 版本
- **Node.js 16+**：推荐使用 LTS 版本

### 包管理器
- **npm**：默认包管理器

## 部署环境

### 云平台
- **Cloudflare**：托管前端应用和后端 API
- **Cloudflare Pages**：前端静态资源托管
- **Cloudflare Workers**：后端 API 执行环境

### 数据库
- **Cloudflare D1**：生产环境数据库

## 测试工具

### 单元测试
- **Vitest**：用于前端组件和逻辑测试

### 端到端测试
- **Playwright/Cypress**：可选的端到端测试框架

## 代码质量工具

### 代码检查
- **ESLint**：JavaScript/TypeScript 代码检查
- **Prettier**：代码格式化

### 类型检查
- **TypeScript**：静态类型检查

## CI/CD 工具

### 持续集成
- **GitHub Actions**：自动化构建和部署流程

## 项目依赖管理

### 主要依赖
- 查看 `package.json` 文件获取完整依赖列表

## 开发工具推荐

### 编辑器
- **VS Code**：推荐使用 VS Code 及相关插件进行开发

### 浏览器开发工具
- **Chrome DevTools**：用于调试前端应用

### API 测试工具
- **Postman/Insomnia**：用于测试后端 API