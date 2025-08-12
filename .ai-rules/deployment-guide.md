---
title: Deployment Guide
description: "Defines the deployment process, environment setup, and release procedures."
inclusion: always
---

# ProSub 部署指南

## 部署架构概述

ProSub 采用现代化的云原生部署架构，基于 Cloudflare 平台实现全球分布式部署：

1. **前端应用**：部署在 Cloudflare Pages 上，提供全球 CDN 加速
2. **后端 API**：运行在 Cloudflare Workers 上，利用边缘计算优势
3. **数据库**：使用 Cloudflare D1，提供分布式 SQLite 数据库服务
4. **缓存存储**：使用 Cloudflare KV，提供键值对缓存服务

## 部署环境要求

### 开发环境
- Node.js 16+ (推荐使用 LTS 版本)
- npm 8+ 或 yarn 1.22+
- Wrangler CLI (Cloudflare Workers 开发工具)
- Git 版本控制工具

### 生产环境
- Cloudflare 账户（需要绑定信用卡）
- 自定义域名（可选，但推荐）

## 环境变量配置

### 必需环境变量
```bash
# Cloudflare Account ID (从 Cloudflare 仪表板获取)
CLOUDFLARE_ACCOUNT_ID=your_account_id

# Cloudflare API Token (需要 Workers 和 D1 权限)
CLOUDFLARE_API_TOKEN=your_api_token

# 数据库名称
DB_NAME=prosub_db
```

### 可选环境变量
```bash
# 自定义域名
CUSTOM_DOMAIN=your-domain.com

# API 路径前缀
API_ROUTE_PREFIX=/api
```

## 前端部署步骤

### 1. 构建前端应用
```bash
# 安装依赖
npm install

# 构建生产版本
npm run build
```

### 2. 部署到 Cloudflare Pages
```bash
# 使用 Wrangler 部署 (需要先安装 Wrangler)
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署到 Cloudflare Pages
wrangler pages deploy dist/ --project-name=prosub-dashboard
```

或者通过 GitHub Actions 自动部署：
1. 将代码推送到 GitHub 仓库
2. 在 Cloudflare Pages 中连接 GitHub 仓库
3. 配置构建设置：
   - 构建命令：`npm run build`
   - 构建输出目录：`dist`

## 后端部署步骤

### 1. 数据库设置
```bash
# 创建 D1 数据库
wrangler d1 create prosub-db

# 记录返回的 database_id 和 database_name
```

### 2. 应用数据库模式
```bash
# 查看 schema.sql 文件确认表结构
cat schema.sql

# 应用数据库迁移
wrangler d1 execute prosub-db --file=schema.sql
```

### 3. 配置 wrangler.toml
```toml
name = "prosub-api"
main = "src/index.ts"
compatibility_date = "2023-04-01"

[[ d1_databases ]]
binding = "DB"
database_name = "prosub-db"
database_id = "your_database_id"

[[ kv_namespaces ]]
binding = "KV"
id = "your_kv_namespace_id"
```

### 4. 部署 Workers
```bash
# 部署到 Cloudflare Workers
wrangler deploy
```

## 数据库迁移

### 本地开发数据库
```bash
# 初始化本地数据库
npm run init-db

# 应用数据库模式到本地
npm run db:migrate
```

### 生产环境数据库
```bash
# 应用数据库模式到生产环境
npm run db:migrate:prod
```

### 数据库备份和恢复
```bash
# 备份数据库 (需要 Wrangler Pro)
wrangler d1 backup create prosub-db

# 查看备份列表
wrangler d1 backup list prosub-db

# 恢复数据库 (谨慎操作)
wrangler d1 backup restore prosub-db --backup-id=backup_id
```

## 环境配置

### 开发环境
1. 复制 `.env.example` 到 `.env`
2. 填入必要的环境变量
3. 启动开发服务器：
```bash
npm run dev
```

### 测试环境
1. 设置独立的测试数据库
2. 使用不同的环境变量配置
3. 部署到独立的 Workers 和 Pages 环境

### 生产环境
1. 使用正式的域名配置
2. 配置 SSL 证书（Cloudflare 自动提供）
3. 设置适当的缓存策略

## 域名和 SSL 配置

### 自定义域名设置
1. 在 Cloudflare Pages 项目设置中添加自定义域名
2. 在域名注册商处添加 CNAME 记录指向 Cloudflare 提供的域名
3. 等待 SSL 证书自动配置完成

### 子域名配置
```bash
# API 子域名示例
api.yourdomain.com -> prosub-api.your-subdomain.workers.dev

# 通过 Cloudflare 代理实现
```

## 监控和日志

### Cloudflare Workers 监控
1. 在 Cloudflare 仪表板中查看 Workers 性能指标
2. 监控请求速率、错误率和延迟
3. 设置告警规则

### 日志查看
```bash
# 实时查看 Workers 日志
wrangler tail

# 查看特定时间段的日志
wrangler tail --since=1h
```

### 前端应用监控
1. 使用 Cloudflare Analytics 查看 Pages 访问统计
2. 集成第三方监控服务（如 Sentry）进行错误跟踪

## 安全配置

### 访问控制
1. 配置 Cloudflare 防火墙规则限制访问
2. 使用 API 密钥保护敏感接口
3. 实施速率限制防止滥用

### 数据安全
1. 确保环境变量不包含在代码中
2. 使用加密存储敏感信息
3. 定期轮换 API 密钥

## 性能优化

### 缓存策略
1. 配置 Cloudflare CDN 缓存规则
2. 使用 KV 存储缓存频繁访问的数据
3. 设置适当的缓存过期时间

### 数据库优化
1. 为常用查询字段添加索引
2. 优化查询语句避免全表扫描
3. 合理分页处理大量数据

## 故障排除

### 常见部署问题
1. **权限错误**：
   - 检查 Cloudflare API Token 权限
   - 确认账户已绑定信用卡

2. **数据库连接失败**：
   - 检查 wrangler.toml 中数据库配置
   - 确认数据库已正确创建

3. **环境变量缺失**：
   - 检查 .env 文件配置
   - 确认生产环境变量已正确设置

### 回滚策略
1. **前端回滚**：
   ```bash
   # 部署指定版本
   wrangler pages deploy dist/ --project-name=prosub-dashboard --branch=rollback-version
   ```

2. **后端回滚**：
   ```bash
   # 回滚到指定版本的 Worker
   wrangler deploy --version-id=previous_version_id
   ```

## 自动化部署

### GitHub Actions 配置
```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare

on:
  push:
    branches:
      - main

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: prosub-dashboard
          directory: dist

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Deploy to Cloudflare Workers
        run: npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

## 备份和灾难恢复

### 数据备份策略
1. **数据库备份**：
   - 定期创建 D1 数据库备份
   - 将备份导出到安全存储

2. **代码备份**：
   - 使用 Git 进行版本控制
   - 定期推送到远程仓库

### 灾难恢复计划
1. **数据恢复**：
   - 从最近的数据库备份恢复
   - 验证数据完整性

2. **服务恢复**：
   - 重新部署应用到 Cloudflare
   - 验证所有功能正常运行

## 成本管理

### Cloudflare 成本控制
1. **监控使用量**：
   - 定期检查 Workers 执行时间
   - 监控 D1 数据库存储和查询次数

2. **优化资源使用**：
   - 合理设置缓存减少重复请求
   - 优化数据库查询减少执行时间

## 版本管理

### 语义化版本控制
1. **版本格式**：`MAJOR.MINOR.PATCH`
2. **发布策略**：
   - 主版本：不兼容的 API 修改
   - 次版本：向后兼容的功能性新增
   - 修订版本：向后兼容的问题修正

### 发布流程
1. 更新 package.json 版本号
2. 创建 Git 标签
3. 部署到生产环境
4. 更新文档和变更日志