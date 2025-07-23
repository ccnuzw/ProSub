// src/types/index.ts

// To extend ProcessEnv for Cloudflare Workers KV binding
// This is a common pattern for adding custom environment variables to TypeScript's ProcessEnv
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      KV: KVNamespace;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export interface Node {
  id: string;
  name: string;
  server: string;
  port: number;
  password?: string; // Common for SS, Trojan, SOCKS5
  type: 'ss' | 'ssr' | 'vmess' | 'vless' | 'trojan' | 'socks5' | 'anytls' | 'tuic' | 'hysteria' | 'hysteria2' | 'vless-reality';
  // Generic parameters for protocol-specific configurations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>;
}

export interface HealthStatus {
  status: 'online' | 'offline' | 'checking'; // 'checking' 状态是前端专用的
  timestamp: string;
  error?: string;
  latency?: number; // 新增：用于存储延迟（毫秒）
}


export interface Subscription {
  id: string;
  name: string;
  url: string;
  nodeCount?: number; // 新增：订阅包含的节点数量
  lastUpdated?: string; // 新增：最后更新时间
  error?: string; // 新增：更新失败时的错误信息
}

export interface SubscriptionRule {
  type: 'include' | 'exclude'; // 规则类型：包含或排除
  field: 'name'; // 作用字段，目前只支持名称，未来可扩展
  pattern: string; // 匹配的正则表达式或关键字
}

export interface ProfileSubscription {
  id: string; // 订阅的 ID
  rules?: SubscriptionRule[]; // 应用于该订阅的规则列表
}

export interface Profile {
  id: string;
  name: string;
  alias?: string;
  nodes: string[]; // 手动选择的节点ID列表
  subscriptions: ProfileSubscription[]; // 修改：现在是包含规则的对象列表
  updatedAt: string;
}

export interface ProfileTrafficData {
  key: string;
  name: string;
  count: number;
}

export interface User {
  id: string;
  name: string;
  password?: string; // Added for authentication
  profiles: string[]; // List of profile IDs associated with this user
  defaultPasswordChanged?: boolean; // New field to track if default password has been changed
}
