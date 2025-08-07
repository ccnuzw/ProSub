// 基础类型定义
export interface Node {
  id: string;
  name: string;
  server: string;
  port: number;
  password?: string;
  type: string;
  params?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subscription {
  id: string;
  name: string;
  url: string;
  nodeCount: number;
  lastUpdated?: string;
  error?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Profile {
  id: string;
  name: string;
  alias?: string; // 新增
  description?: string;
  clientType?: string; // 修改为可选
  nodeIds?: string[]; // 新增
  subscriptionIds?: string[]; // 新增
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HealthStatus {
  nodeId: string;
  status: 'online' | 'offline' | 'unknown' | 'checking';
  latency?: number;
  lastChecked: string;
  error?: string;
}

export interface NodeGroup {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionRule {
  id?: string;
  profileId: string;
  type: 'include' | 'exclude';
  pattern: string;
  description?: string;
  createdAt?: string;
}

export interface TrafficRecord {
  id?: string;
  profileId: string;
  alias: string;
  bytes?: number;
  timestamp: string;
}

export interface Template {
  id?: string;
  name: string;
  description?: string;
  clientType: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationParams;
}

// Cloudflare Workers 环境类型
export interface Env {
  KV: any; // KVNamespace
  DB: any; // D1Database
  __STATIC_CONTENT: any; // KVNamespace
}
