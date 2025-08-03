// 基础类型定义
export interface Node {
  id: string;
  name: string;
  server: string;
  port: number;
  password?: string;
  type: 'ss' | 'ssr' | 'vmess' | 'vless' | 'trojan' | 'socks5' | 'anytls' | 'tuic' | 'hysteria' | 'hysteria2' | 'vless-reality';
  params?: Record<string, any>;
}

export interface Subscription {
  id: string;
  name: string;
  url: string;
  nodeCount: number;
  lastUpdated: string | null;
  error: string | null;
}

export interface Profile {
  id: string;
  name: string;
  description?: string;
  nodes: string[];
  subscriptions: string[];
  rules: SubscriptionRule[];
  clientType: 'clash' | 'surge' | 'quantumult-x' | 'loon' | 'sing-box';
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionRule {
  type: 'include' | 'exclude';
  pattern: string;
  description?: string;
}

export interface RuleSetConfig {
  name: string;
  rules: string[];
  type: 'clash' | 'surge' | 'quantumult-x' | 'loon' | 'sing-box';
}

export interface Env {
  KV: KVNamespace;
  __STATIC_CONTENT: KVNamespace;
}

// 用户相关类型
export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

// 节点组类型
export interface NodeGroup {
  id: string;
  name: string;
  description?: string;
  nodes: string[];
  createdAt: string;
  updatedAt: string;
}

// 健康检查类型
export interface HealthStatus {
  nodeId: string;
  status: 'online' | 'offline' | 'unknown' | 'checking';
  latency?: number;
  lastChecked: string;
  error?: string;
}

// 流量统计类型
export interface TrafficRecord {
  timestamp: string;
  profileId: string;
  alias: string;
  bytes?: number;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分页类型
export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationParams;
}