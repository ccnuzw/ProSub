# ProSub：轻量级机场订阅和自建节点管理分享项目

## 1. 项目概述

ProSub 是一个基于 Cloudflare Pages 和 KV 存储的轻量级机场订阅和自建节点管理分享项目。它旨在提供一个简单、高效的方式来管理、组合和分享您的代理节点和订阅链接。

### 1.1. 核心功能

*   **多协议支持：** 支持所有主流代理协议，包括 Vless、anytls、vless reality、tuic、hysteria、hysteria2、Shadowsocks、V2Ray (VMess)、Trojan、SOCKS5 等。
*   **通用订阅解析：** 能够解析来自不同机场的通用订阅链接，包括base64、ymal、txt 等。
*   **灵活的节点组合：** 允许用户自由组合来自不同订阅和自建节点的代理，生成新的自定义订阅。
*   **用户管理：** （可选）支持简单的用户系统，为不同用户生成专属的订阅链接。
*   **通用订阅输出：** 生成的订阅链接兼容所有主流代理客户端，如 V2RanyN、Clash、Clash Meta、Mihomo、Sing-box、Shadowrocket、Quantumult X、loon、surge、flyclash、karing 等。
*   **无第三方依赖：** 所有订阅转换和处理都在 Cloudflare Workers 中完成，无需依赖任何第三方服务。

### 1.2. 技术栈

*   **前端：** Next.js (或任何您喜欢的前端框架，如 Vue.js、Svelte)
*   **后端：** Cloudflare Workers
*   **数据存储：** Cloudflare KV
*   **部署：** Cloudflare Pages

## 2. 系统设计

### 2.1. 架构图

```
+-----------------+      +---------------------+      +-------------------+
|   Web 界面      | <--> |  Cloudflare Pages   | <--> |  Cloudflare KV    |
| (Next.js)       |      | (静态站点托管)      |      | (数据存储)        |
+-----------------+      +---------------------+      +-------------------+
      ^                          ^
      |                          |
      v                          v
+-----------------+      +---------------------+
|   用户          | <--> |  Cloudflare Workers |
| (浏览器)        |      | (API & 订阅生成)    |
+-----------------+      +---------------------+
```

### 2.2. 数据模型 (Cloudflare KV)

*   **`nodes:<node_id>`:** 存储单个代理节点的详细信息。
    *   `id`: 节点 ID (UUID)
    *   `name`: 节点名称
    *   `type`: 协议类型 (e.g., `ss`, `vmess`, `trojan`)
    *   `server`: 服务器地址
    *   `port`: 端口
    *   `password`: 密码 (或其他认证信息)
    *   `...`: 其他协议特定参数
*   **`subscriptions:<sub_id>`:** 存储原始机场订阅链接。
    *   `id`: 订阅 ID (UUID)
    *   `name`: 订阅名称
    *   `url`: 订阅链接
*   **`profiles:<profile_id>`:** 存储用户组合的节点配置文件。
    *   `id`: 配置文件 ID (UUID)
    *   `name`: 配置文件名称
    *   `nodes`: 节点 ID 列表
    *   `subscriptions`: 订阅 ID 列表
*   **`users:<user_id>`:** (可选) 存储用户信息。
    *   `id`: 用户 ID (UUID)
    *   `name`: 用户名
    *   `profiles`: 配置文件 ID 列表

### 2.3. API 设计 (Cloudflare Workers)

*   **`POST /api/nodes`:** 创建一个新的代理节点。
*   **`GET /api/nodes`:** 获取所有代理节点。
*   **`PUT /api/nodes/:id`:** 更新一个代理节点。
*   **`DELETE /api/nodes/:id`:** 删除一个代理节点。
*   **`POST /api/subscriptions`:** 添加一个新的机场订阅。
*   **`GET /api/subscriptions`:** 获取所有机场订阅。
*   **`DELETE /api/subscriptions/:id`:** 删除一个机场订阅。
*   **`POST /api/profiles`:** 创建一个新的配置文件。
*   **`GET /api/profiles`:** 获取所有配置文件。
*   **`PUT /api/profiles/:id`:** 更新一个配置文件。
*   **`DELETE /api/profiles/:id`:** 删除一个配置文件。
*   **`GET /subscribe/:profile_id`:** 生成并返回指定配置文件的订阅内容。

## 3. 开发计划

### 3.1. 阶段一：核心功能实现

1.  **环境搭建：**
    *   初始化 Next.js 项目。
    *   配置 Cloudflare Pages 和 Workers。
    *   设置 Cloudflare KV 命名空间。
2.  **节点管理：**
    *   实现节点的增删改查 (CRUD) API。
    *   创建节点管理的前端界面。
3.  **订阅管理：**
    *   实现订阅的增删改查 (CRUD) API。
    *   创建订阅管理的前端界面。
4.  **配置文件管理：**
    *   实现配置文件的增删改查 (CRUD) API。
    *   创建配置文件管理的前端界面，允许用户从节点和订阅中选择并组合。
5.  **订阅生成：**
    *   实现 `/sub/:profile_id` 端点。
    *   在该端点中，获取配置文件信息，解析订阅链接，组合节点，并生成兼容的订阅内容。

### 3.2. 阶段二：高级功能和优化

1.  **用户系统：**
    *   实现简单的用户注册和登录。
    *   将配置文件与用户关联。
2.  **节点健康检查：**
    *   定期检查节点的可用性和延迟。
    *   在前端界面上显示节点状态。
3.  **流量统计：**
    *   （如果可能）记录每个订阅链接的流量使用情况。
4.  **前端优化：**
    *   使用 UI 库（如 antd、MUI）美化界面。
    *   提高网站的响应速度和用户体验。

## 4. 部署

1.  **项目上传至github，然后在cloudflare的pages部署，前端后端都部署在同一个pages内：**
    *   将 Next.js 项目连接到 Cloudflare Pages。
    *   配置构建命令和输出目录。


## 5. 总结

ProSub 是一个功能强大且高度可定制的项目。通过遵循本文档中的设计和计划，您可以构建一个满足您所有代理管理需求的轻量级、高效的解决方案。
