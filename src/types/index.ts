export interface Node {
  id: string;
  name: string;
  server: string;
  port: number;
  password?: string; // Common for SS, Trojan, SOCKS5
  type: 'ss' | 'ssr' | 'vmess' | 'vless' | 'trojan' | 'socks5' | 'anytls' | 'tuic' | 'hysteria' | 'hysteria2' | 'vless-reality';
  // Generic parameters for protocol-specific configurations
  params?: Record<string, any>;
}

export interface Subscription {
  id: string;
  name: string;
  url: string;
}

export interface Profile {
  id: string;
  name: string;
  nodes: string[];
  subscriptions: string[];
}

export interface User {
  id: string;
  name: string;
  password?: string; // Added for authentication
  profiles: string[]; // List of profile IDs associated with this user
  defaultPasswordChanged?: boolean; // New field to track if default password has been changed
}
