// API路由索引
// 这个文件用于记录所有API路由的结构

/*
API路由结构：

/auth/
  ├── login.ts          - 用户登录
  ├── logout.ts         - 用户登出
  └── me.ts            - 获取当前用户信息

/nodes/
  ├── index.ts          - 获取/创建节点列表
  ├── [id]/
  │   └── index.ts      - 获取/更新/删除单个节点
  ├── batch-delete.ts   - 批量删除节点
  ├── batch-import.ts   - 批量导入节点
  └── clear-all.ts      - 清空所有节点

/subscriptions/
  ├── index.ts          - 获取/创建订阅列表
  ├── [id]/
  │   ├── index.ts      - 获取/更新/删除单个订阅
  │   └── update.ts     - 更新订阅内容
  ├── preview/
  │   └── [id].ts       - 预览订阅内容
  ├── batch-import.ts   - 批量导入订阅
  └── alias/
      └── [alias].ts    - 订阅别名访问

/profiles/
  ├── index.ts          - 获取/创建配置文件列表
  └── [id]/
      └── index.ts      - 获取/更新/删除单个配置文件

/node-groups/
  ├── index.ts          - 获取/创建节点组列表
  └── [id]/
      └── index.ts      - 获取/更新/删除单个节点组

/rule-sets/
  ├── index.ts          - 获取/创建规则集列表
  └── [id]/
      └── index.ts      - 获取/更新/删除单个规则集

/users/
  ├── index.ts          - 获取/创建用户列表
  └── [id]/
      └── index.ts      - 获取/更新/删除单个用户

/utility/
  ├── stats.ts          - 获取统计数据
  ├── traffic.ts        - 获取流量统计
  ├── node-statuses.ts  - 获取节点状态
  ├── node-health-check.ts - 节点健康检查
  └── subscription-statuses.ts - 订阅状态
*/ 