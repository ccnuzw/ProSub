# ProSub: 你的私人代理订阅与节点管理中心

ProSub 是一个基于 Cloudflare Pages 和 KV 存储的轻量级、高性能代理订阅管理项目。它允许你轻松聚合、管理和分享来自不同来源的代理节点，生成完全自定义的订阅链接。

![ProSub 仪表盘截图](https://i.imgur.com/your-dashboard-screenshot.png) ## ✨ 核心功能

我们从零开始，共同构建了一套功能强大且用户体验优秀的核心功能：

* **仪表盘**: 直观展示节点、订阅、配置文件和流量请求的关键统计数据。
* **强大的节点管理**:
    * 支持 Vmess, VLESS, SS, Trojan, SSR 等多种主流协议节点的增删改查。
    * **智能健康检查**: 一键检测所有节点的在线状态和真实网络延迟(ms)。
    * **批量操作**: 支持从剪贴板批量导入节点，并能自动进行**精确去重**（服务器+端口+密码）。支持多选批量删除。
    * **智能排序与过滤**: 节点列表可按状态和延迟自动排序，并支持按名称、服务器、类型进行实时搜索。
* **完善的订阅管理**:
    * 支持聚合多个外部订阅链接。
    * **一键更新**: 可单独或批量更新所有订阅，获取最新的节点列表。
    * **状态总览**: 清晰展示每个订阅的节点数量、最后更新时间及更新状态。
    * **节点预览**: 无需下载，直接在弹窗内以表格形式预览订阅中的所有节点信息。
    * **批量导入**: 支持从剪贴板批量导入多个订阅链接。
* **灵活的配置文件**:
    * 通过直观的**穿梭框**界面，自由组合手动添加的节点和外部订阅。
    * 穿梭框内的节点列表同样支持**状态显示和智能排序**，方便你永远优先选择最优质的节点。
    * 为每个配置文件生成独一无二的、兼容主流客户端的订阅链接。
* **多用户支持**:
    * 内置简单的用户管理系统，支持多用户使用。
    * 默认 `admin` 管理员账户，首次登录强制修改密码，确保安全。

## 🚀 技术栈

* **前端**: Vue 3, Vite, Tailwind CSS, Ant Design, TypeScript
* **后端/部署**: Cloudflare Workers (Edge Runtime)
* **数据库**: Cloudflare KV

## 部署指南

本项目专为 Cloudflare Pages 和 Workers 设计，请严格按照以下步骤进行部署。

### 前提条件
* 一个 GitHub 账号
* 一个 Cloudflare 账号
* 本地已安装 Node.js 和 Git

### 第 1 步：创建 KV 命名空间
1.  登录 Cloudflare 仪表盘，进入 **Workers & Pages** -> **KV**。
2.  点击 **创建命名空间**，输入一个你喜欢的名字（例如 `PROSUB_DB`）。

### 第 2 步：部署前端到 Cloudflare Pages
1.  在 Cloudflare 仪表盘，进入 **Workers & Pages**，选择 **创建应用程序** -> **Pages** -> **连接到 Git**。
2.  选择你的 `ProSub` GitHub 仓库。
3.  在 **构建设置** 页面，进行如下配置：
    * **框架预设**: 选择 `Vue`。
    * **构建命令**: `npm run build`
    * **构建输出目录**: `dist`
4.  点击 **保存并部署**。

### 第 3 步：部署后端 Worker
1.  进入项目根目录下的 `worker` 文件夹。
2.  确保 `worker/wrangler.toml` 中的 `name` 字段是你 Worker 的名称（例如 `prosub-worker`）。
3.  运行部署命令：`npx wrangler deploy`
    * 如果是首次部署，Wrangler 会引导你完成认证和项目创建。

### 第 4 步：配置 Pages 项目的 Worker 绑定 (最关键的一步)
为了让前端 Pages 项目能够与后端 Worker 通信，你需要将 Worker 绑定到 Pages 项目。

1.  登录 Cloudflare 仪表盘，进入你刚刚部署的 **Pages 项目**。
2.  点击 **Settings** -> **Functions**。
3.  向下滚动到 **Worker bindings (Beta)**，点击 **Add binding**。
    * **变量名称**: `PROSUB_WORKER` (这个名称可以自定义，但前端代码中需要引用它)
    * **Worker**: 选择你在第 3 步部署的 Worker (例如 `prosub-worker`)。
    * 保存。
4.  返回 **Settings** -> **Functions**，向下滚动到 **Compatibility Flags** (兼容性标志)。
5.  在 **Production** 下，点击 **Configure Flags**，然后添加 `nodejs_compat` 这个标志。
6.  保存。

### 第 5 步：配置 Worker 的 KV 绑定
为了让后端 Worker 能够访问 KV 存储，你需要将 KV 命名空间绑定到 Worker。

1.  登录 Cloudflare 仪表盘，进入你刚刚部署的 **Worker 项目**。
2.  点击 **Settings** -> **Variables**。
3.  向下滚动到 **KV Namespace Bindings**，点击 **Add binding**。
    * **变量名称**: `KV` (这个名称必须是 `KV`，与 Worker 代码中的 `env.KV` 对应)
    * **KV 命名空间**: 选择你在第 1 步创建的那个命名空间 (例如 `PROSUB_DB`)。
    * 保存。

### 第 6 步：重新部署
回到 Pages 项目的 **Deployments** 页面，点击 **Retry deployment** 重新触发一次部署。这次，应用将会使用所有正确的配置，并成功上线。

### 第 7 步：首次登录
部署成功后，访问你的 `*.pages.dev` 网址。
* 默认用户名: `admin`
* 默认密码: `admin`
首次登录后，系统会强制你修改密码。

## 本地开发

### 前端开发
1.  进入项目根目录。
2.  安装依赖：`npm install`
3.  启动开发服务器：`npm run dev`
    * 前端会自动通过 Vite 代理将 `/api` 请求转发到后端 Worker。

### 后端开发
1.  进入 `worker` 目录。
2.  安装 Wrangler：`npm install -g wrangler`
3.  登录 Wrangler：`wrangler login`
4.  启动本地开发服务器：`wrangler dev --local`
    * 确保 `worker/wrangler.toml` 中配置了 `[dev]` 部分的 `kv_namespaces`，以便本地 KV 存储正常工作。

---
*这个项目在 Gemini 的协助下完成了从 Bug 修复到功能完善的全过程。*