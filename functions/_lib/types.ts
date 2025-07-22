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
}

export interface Profile {
  id: string;
  name: string;
  alias?: string; // <-- Added this line
  nodes: string[];
  subscriptions: string[];
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

interface Env {
  KV: KVNamespace;
  NODE_ENV: string; // For secure cookie flag
  __STATIC_CONTENT: KVNamespace; // Add this line
}