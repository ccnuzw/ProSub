# ProSub：轻量级机场订阅和自建节点管理分享项目

## 1. 项目概述

ProSub 是一个基于 Cloudflare Pages 和 KV 存储的轻量级机场订阅和自建节点管理分享项目。它旨在提供一个简单、高效的方式来管理、组合和分享您的代理节点和订阅链接。

### 1.1. 核心功能

*   **多协议支持：** 支持所有主流代理协议，包括 Vless、vless reality、tuic、hysteria、hysteria2、ss、ssr、vmess、anytls、V2Ray (VMess)、Trojan、SOCKS5 等。
*   **通用订阅解析：** 能够解析来自不同机场的通用订阅链接。
*   **灵活的节点组合：** 允许用户自由组合来自不同订阅和自建节点的代理，生成新的自定义订阅。
*   **用户管理：** （可选）支持简单的用户系统，为不同用户生成专属的订阅链接。
*   **通用订阅输出：** 生成的订阅链接兼容所有主流代理客户端，如 openclash、clash meta、flyclash、loon、surge、karing、mihomo、sing-box、Clash、Shadowrocket、Quantumult X 等。
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

## 参考项目：sub-store（https://github.com/sub-store-org/Sub-Store）、sub-hub(https://github.com/shiyi11yi/Sub-Hub)、sublink-worker（https://github.com/7Sageer/sublink-worker）、MiSub（https://github.com/imzyb/MiSub）

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
    *   实现 `/subscribe/:profile_id` 端点。
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

ProSub 项目的部署主要依赖于 Cloudflare Pages 和 Cloudflare KV。由于项目的前端 (Next.js) 和后端 API (Next.js API Routes，由 Cloudflare Pages 自动作为 Serverless Functions 处理) 都集成在一个 Next.js 项目中，因此部署过程非常简化。

### 4.1. 前提条件

*   一个 Cloudflare 账号。
*   已安装 Git。

### 4.2. 克隆项目仓库

首先，将 ProSub 项目仓库克隆到您的本地机器：

```bash
git clone https://github.com/imzyb/ProSub.git
cd ProSub
```

### 4.3. 配置 Cloudflare KV 存储

ProSub 使用 Cloudflare KV (Key-Value) 存储来持久化节点、订阅和配置文件数据。您需要创建一个 KV 命名空间并将其绑定到您的 Pages 项目。

1.  **登录 Cloudflare Dashboard**：
    访问 [Cloudflare Dashboard](https://dash.cloudflare.com/) 并登录您的账号。
2.  **创建 KV 命名空间**：
    *   在 Dashboard 左侧导航栏中，点击 **Workers & Pages**。
    *   点击 **KV** 选项卡。
    *   点击 **创建命名空间** 按钮。
    *   为您的 KV 命名空间命名，例如 `PROSUB_DB` (这个名称将在后续步骤中用到)。
    *   点击 **添加**。

### 4.4. 部署到 Cloudflare Pages

现在，您可以将项目部署到 Cloudflare Pages。Cloudflare Pages 会自动处理 Next.js 项目的构建和部署，包括将 API Routes 转换为 Serverless Functions。

1.  **创建新的 Pages 项目**：
    *   在 Cloudflare Dashboard 左侧导航栏中，点击 **Workers & Pages**。
    *   点击 **创建应用程序**。
    *   选择 **Pages** 选项卡，然后点击 **连接到 Git**。
    *   选择您的 Git 提供商 (例如 GitHub)，授权 Cloudflare 访问您的仓库。
    *   选择您刚刚克隆的 `ProSub` 仓库，然后点击 **开始设置**。
2.  **配置构建设置**：
    *   **项目名称**：输入一个项目名称 (例如 `prosub-app`)。
    *   **生产分支**：选择 `main` (或您希望部署的分支)。
    *   **构建设置**：
        *   **框架预设**：选择 `Next.js`。
        *   **构建命令**：`npm install && npm run build`
        *   **构建输出目录**：`.next`
    *   **环境变量**：
        *   在 **环境变量** 部分，点击 **添加变量**。
        *   **变量名称**：`PROSUB_KV` (这个名称是项目代码中预期的 KV 绑定名称)。
        *   **值**：选择您在步骤 4.3 中创建的 KV 命名空间 (例如 `PROSUB_DB`)。
        *   点击 **保存**。
3.  **部署项目**：
    *   点击 **保存并部署**。
    *   Cloudflare Pages 将会自动拉取您的代码，安装依赖，构建项目，并将您的应用程序部署到全球的 Cloudflare CDN 上。

部署完成后，您将获得一个 Pages 域名，您的 ProSub 应用程序将通过该域名访问。

### 4.5. 自定义域名 (可选)

如果您想使用自己的域名，可以在 Cloudflare Pages 项目设置中进行配置：

1.  在 Cloudflare Dashboard 中，导航到您的 Pages 项目。
2.  点击 **自定义域** 选项卡。
3.  按照指示添加和配置您的自定义域名。

### 4.6. 本地开发

如果您想在本地进行开发和测试，可以按照以下步骤运行项目：

1.  **安装依赖**：
    ```bash
    npm install
    ```
2.  **运行开发服务器**：
    ```bash
    npm run dev
    ```
    项目将在 `http://localhost:3000` (默认) 启动。请注意，本地开发环境无法直接访问 Cloudflare KV，您可能需要模拟 KV 行为或使用本地存储进行开发。

## 5. 总结

ProSub 是一个功能强大且高度可定制的项目。通过遵循本文档中的设计和计划，您可以构建一个满足您所有代理管理需求的轻量级、高效的解决方案。
