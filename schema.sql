-- ProSub D1 Database Schema

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 节点表
CREATE TABLE IF NOT EXISTS nodes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  server TEXT NOT NULL,
  port INTEGER NOT NULL,
  password TEXT,
  type TEXT NOT NULL,
  params TEXT, -- JSON字符串
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 节点健康状态表
CREATE TABLE IF NOT EXISTS node_health_status (
  node_id TEXT PRIMARY KEY,
  status TEXT NOT NULL, -- 'online', 'offline', 'unknown', 'checking'
  latency INTEGER, -- 延迟毫秒数
  last_checked TEXT NOT NULL,
  error TEXT,
  FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

-- 订阅表
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  node_count INTEGER DEFAULT 0,
  last_updated TEXT,
  error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 配置文件表
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  alias TEXT, -- 新增别名列
  description TEXT,
  client_type TEXT NOT NULL, -- 'clash', 'surge', 'quantumult-x', 'loon', 'sing-box'
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 配置文件节点关联表
CREATE TABLE IF NOT EXISTS profile_nodes (
  profile_id TEXT NOT NULL,
  node_id TEXT NOT NULL,
  PRIMARY KEY (profile_id, node_id),
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

-- 配置文件订阅关联表
CREATE TABLE IF NOT EXISTS profile_subscriptions (
  profile_id TEXT NOT NULL,
  subscription_id TEXT NOT NULL,
  PRIMARY KEY (profile_id, subscription_id),
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

-- 订阅规则表
CREATE TABLE IF NOT EXISTS subscription_rules (
  id TEXT PRIMARY KEY,
  subscription_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'include', 'exclude'
  pattern TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

-- 节点组表
CREATE TABLE IF NOT EXISTS node_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 节点组成员表
CREATE TABLE IF NOT EXISTS node_group_members (
  group_id TEXT NOT NULL,
  node_id TEXT NOT NULL,
  PRIMARY KEY (group_id, node_id),
  FOREIGN KEY (group_id) REFERENCES node_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

-- 流量统计表
CREATE TABLE IF NOT EXISTS traffic_records (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  alias TEXT NOT NULL,
  bytes INTEGER,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes(type);
CREATE INDEX IF NOT EXISTS idx_nodes_server ON nodes(server);
CREATE INDEX IF NOT EXISTS idx_node_health_status ON node_health_status(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_url ON subscriptions(url);
CREATE INDEX IF NOT EXISTS idx_profiles_client_type ON profiles(client_type);
CREATE INDEX IF NOT EXISTS idx_traffic_records_timestamp ON traffic_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_traffic_records_profile ON traffic_records(profile_id); 