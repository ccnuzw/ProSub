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
}

export interface SubscriptionRule {
  id: string;
  type: 'include' | 'exclude';
  pattern: string;
}

export interface Profile {
  id: string;
  name: string;
  alias?: string;
  nodes: string[]; // Node IDs
  subscriptions: (string | { 
    id: string; 
    rules: SubscriptionRule[] 
  })[];
  ruleSets?: Record<string, RuleSetConfig>;
  updatedAt: string;
}

export interface RuleSetConfig {
  id?: string;
  type: 'local' | 'remote';
  url?: string;
}

export interface User {
  id: string;
  name: string;
  password: string;
  defaultPasswordChanged: boolean;
}

// 健康检查状态接口
export interface HealthStatus {
  status: 'online' | 'offline' | 'checking' | 'error';
  latency?: number;
  error?: string;
}

// 新增节点分组接口
export interface NodeGroup {
  id: string;
  name: string;
  nodeIds: string[];
  createdAt: string;
  updatedAt: string;
}

// 新增规则集接口
export interface CustomRuleSet {
  id: string;
  name: string;
  description: string;
  content: string;
  clientType: 'clash' | 'surge' | 'quantumultx' | 'loon' | 'sing-box' | 'general';
  createdAt: string;
  updatedAt: string;
}

export interface Env {
  KV: any;
}