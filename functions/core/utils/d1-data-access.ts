import { Node, Subscription, Profile, User, HealthStatus, NodeGroup, TrafficRecord, Env } from '@shared/types';

// 节点数据访问
export class NodeDataAccess {
  static async getAll(env: Env): Promise<Node[]> {
    const result = await env.DB.prepare(`
      SELECT id, name, server, port, password, type, params, created_at, updated_at 
      FROM nodes 
      ORDER BY created_at DESC
    `).all();
    
    return result.results.map(row => ({
      id: row.id as string,
      name: row.name as string,
      server: row.server as string,
      port: row.port as number,
      password: row.password as string,
      type: row.type as string,
      params: row.params ? JSON.parse(row.params as string) : {},
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string
    }));
  }

  static async getById(env: Env, id: string): Promise<Node | null> {
    const result = await env.DB.prepare(`
      SELECT id, name, server, port, password, type, params, created_at, updated_at 
      FROM nodes 
      WHERE id = ?
    `).bind(id).first();
    
    if (!result) return null;
    
    return {
      id: result.id as string,
      name: result.name as string,
      server: result.server as string,
      port: result.port as number,
      password: result.password as string,
      type: result.type as string,
      params: row.params ? JSON.parse(row.params as string) : {},
      createdAt: result.created_at as string,
      updatedAt: result.updated_at as string
    };
  }

  static async create(env: Env, node: Node): Promise<Node> {
    const now = new Date().toISOString();
    const params = JSON.stringify(node.params || {});
    
    await env.DB.prepare(`
      INSERT INTO nodes (id, name, server, port, password, type, params, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      node.id,
      node.name,
      node.server,
      node.port,
      node.password || '',
      node.type,
      params,
      now,
      now
    ).run();
    
    return { ...node, createdAt: now, updatedAt: now };
  }

  static async update(env: Env, id: string, node: Node): Promise<Node> {
    const now = new Date().toISOString();
    const params = JSON.stringify(node.params || {});
    
    await env.DB.prepare(`
      UPDATE nodes 
      SET name = ?, server = ?, port = ?, password = ?, type = ?, params = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      node.name,
      node.server,
      node.port,
      node.password || '',
      node.type,
      params,
      now,
      id
    ).run();
    
    return { ...node, id, updatedAt: now };
  }

  static async delete(env: Env, id: string): Promise<void> {
    await env.DB.prepare('DELETE FROM nodes WHERE id = ?').bind(id).run();
  }

  static async batchDelete(env: Env, ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    
    const placeholders = ids.map(() => '?').join(',');
    const result = await env.DB.prepare(`
      DELETE FROM nodes WHERE id IN (${placeholders})
    `).bind(...ids).run();
    
    return result.meta.changes || 0;
  }

  static async clearAll(env: Env): Promise<void> {
    await env.DB.prepare('DELETE FROM nodes').run();
  }

  static async count(env: Env): Promise<number> {
    const result = await env.DB.prepare('SELECT COUNT(*) as count FROM nodes').first();
    return (result?.count as number) || 0;
  }
}

// 节点健康状态数据访问
export class NodeHealthDataAccess {
  static async getAll(env: Env): Promise<Record<string, HealthStatus>> {
    const result = await env.DB.prepare(`
      SELECT node_id, status, latency, last_checked, error
      FROM node_health_status
    `).all();
    
    const statusMap: Record<string, HealthStatus> = {};
    
    for (const row of result.results) {
      statusMap[row.node_id as string] = {
        nodeId: row.node_id as string,
        status: row.status as string,
        latency: row.latency as number,
        lastChecked: row.last_checked as string,
        error: row.error as string
      };
    }
    
    return statusMap;
  }

  static async getByNodeId(env: Env, nodeId: string): Promise<HealthStatus | null> {
    const result = await env.DB.prepare(`
      SELECT node_id, status, latency, last_checked, error
      FROM node_health_status
      WHERE node_id = ?
    `).bind(nodeId).first();
    
    if (!result) return null;
    
    return {
      nodeId: result.node_id as string,
      status: result.status as string,
      latency: result.latency as number,
      lastChecked: result.last_checked as string,
      error: result.error as string
    };
  }

  static async update(env: Env, status: HealthStatus): Promise<void> {
    const now = new Date().toISOString();
    
    await env.DB.prepare(`
      INSERT OR REPLACE INTO node_health_status (node_id, status, latency, last_checked, error)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      status.nodeId,
      status.status,
      status.latency || null,
      now,
      status.error || null
    ).run();
  }

  static async deleteByNodeId(env: Env, nodeId: string): Promise<void> {
    await env.DB.prepare('DELETE FROM node_health_status WHERE node_id = ?').bind(nodeId).run();
  }
}

// 订阅数据访问
export class SubscriptionDataAccess {
  static async getAll(env: Env): Promise<Subscription[]> {
    const result = await env.DB.prepare(`
      SELECT id, name, url, node_count, last_updated, error, created_at, updated_at
      FROM subscriptions
      ORDER BY created_at DESC
    `).all();
    
    return result.results.map(row => ({
      id: row.id as string,
      name: row.name as string,
      url: row.url as string,
      nodeCount: row.node_count as number,
      lastUpdated: row.last_updated as string,
      error: row.error as string,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string
    }));
  }

  static async getById(env: Env, id: string): Promise<Subscription | null> {
    const result = await env.DB.prepare(`
      SELECT id, name, url, node_count, last_updated, error, created_at, updated_at
      FROM subscriptions
      WHERE id = ?
    `).bind(id).first();
    
    if (!result) return null;
    
    return {
      id: result.id as string,
      name: result.name as string,
      url: result.url as string,
      nodeCount: result.node_count as number,
      lastUpdated: result.last_updated as string,
      error: result.error as string,
      createdAt: result.created_at as string,
      updatedAt: result.updated_at as string
    };
  }

  static async create(env: Env, subscription: Subscription): Promise<Subscription> {
    const now = new Date().toISOString();
    
    await env.DB.prepare(`
      INSERT INTO subscriptions (id, name, url, node_count, last_updated, error, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      subscription.id,
      subscription.name,
      subscription.url,
      subscription.nodeCount || 0,
      subscription.lastUpdated || null,
      subscription.error || null,
      now,
      now
    ).run();
    
    return { ...subscription, createdAt: now, updatedAt: now };
  }

  static async update(env: Env, id: string, subscription: Subscription): Promise<Subscription> {
    const now = new Date().toISOString();
    
    await env.DB.prepare(`
      UPDATE subscriptions 
      SET name = ?, url = ?, node_count = ?, last_updated = ?, error = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      subscription.name,
      subscription.url,
      subscription.nodeCount || 0,
      subscription.lastUpdated || null,
      subscription.error || null,
      now,
      id
    ).run();
    
    return { ...subscription, id, updatedAt: now };
  }

  static async delete(env: Env, id: string): Promise<void> {
    await env.DB.prepare('DELETE FROM subscriptions WHERE id = ?').bind(id).run();
  }

  static async updateStatus(env: Env, id: string, nodeCount: number, error?: string): Promise<Subscription> {
    const now = new Date().toISOString();
    
    await env.DB.prepare(`
      UPDATE subscriptions 
      SET node_count = ?, last_updated = ?, error = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      nodeCount,
      now,
      error || null,
      now,
      id
    ).run();
    
    const subscription = await this.getById(env, id);
    if (!subscription) throw new Error('Subscription not found');
    
    return subscription;
  }
}

// 配置文件数据访问
export class ProfileDataAccess {
  static async getAll(env: Env): Promise<Profile[]> {
    const result = await env.DB.prepare(`
      SELECT id, name, alias, description, client_type, node_ids, subscription_ids, created_at, updated_at
      FROM profiles
      ORDER BY created_at DESC
    `).all();
    
    return result.results.map(row => ({
      id: row.id as string,
      name: row.name as string,
      alias: row.alias as string || '',
      description: row.description as string,
      clientType: row.client_type as string,
      nodeIds: row.node_ids ? JSON.parse(row.node_ids as string) : [],
      subscriptionIds: row.subscription_ids ? JSON.parse(row.subscription_ids as string) : [],
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string
    }));
  }

  static async getById(env: Env, id: string): Promise<Profile | null> {
    const result = await env.DB.prepare(`
      SELECT id, name, alias, description, client_type, node_ids, subscription_ids, created_at, updated_at
      FROM profiles
      WHERE id = ?
    `).bind(id).first();
    
    if (!result) return null;
    
    return {
      id: result.id as string,
      name: result.name as string,
      alias: result.alias as string || '',
      description: result.description as string,
      clientType: result.client_type as string,
      nodeIds: result.node_ids ? JSON.parse(result.node_ids as string) : [],
      subscriptionIds: result.subscription_ids ? JSON.parse(result.subscription_ids as string) : [],
      createdAt: result.created_at as string,
      updatedAt: result.updated_at as string
    };
  }

  static async create(env: Env, profile: Profile): Promise<Profile> {
    const now = new Date().toISOString();
    const nodeIds = JSON.stringify(profile.nodeIds || []);
    const subscriptionIds = JSON.stringify(profile.subscriptionIds || []);
    
    await env.DB.prepare(`
      INSERT INTO profiles (id, name, alias, description, client_type, node_ids, subscription_ids, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      profile.id,
      profile.name,
      profile.alias || '',
      profile.description || '',
      profile.clientType || '',
      nodeIds,
      subscriptionIds,
      now,
      now
    ).run();
    
    return { ...profile, createdAt: now, updatedAt: now };
  }

  static async update(env: Env, id: string, profile: Profile): Promise<Profile> {
    const now = new Date().toISOString();
    const nodeIds = JSON.stringify(profile.nodeIds || []);
    const subscriptionIds = JSON.stringify(profile.subscriptionIds || []);
    
    await env.DB.prepare(`
      UPDATE profiles 
      SET name = ?, alias = ?, description = ?, client_type = ?, node_ids = ?, subscription_ids = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      profile.name,
      profile.alias || '',
      profile.description || '',
      profile.clientType || '',
      nodeIds,
      subscriptionIds,
      now,
      id
    ).run();
    
    return { ...profile, id, updatedAt: now };
  }

  static async delete(env: Env, id: string): Promise<void> {
    await env.DB.prepare('DELETE FROM profiles WHERE id = ?').bind(id).run();
  }
}

// 用户数据访问
export class UserDataAccess {
  static async getById(env: Env, id: string): Promise<User | null> {
    const result = await env.DB.prepare(`
      SELECT id, username, password, role, created_at, updated_at
      FROM users
      WHERE id = ?
    `).bind(id).first();
    
    if (!result) return null;
    
    return {
      id: result.id as string,
      username: result.username as string,
      password: result.password as string,
      role: result.role as string,
      createdAt: result.created_at as string,
      updatedAt: result.updated_at as string
    };
  }

  static async getByUsername(env: Env, username: string): Promise<User | null> {
    const result = await env.DB.prepare(`
      SELECT id, username, password, role, created_at, updated_at
      FROM users
      WHERE username = ?
    `).bind(username).first();
    
    if (!result) return null;
    
    return {
      id: result.id as string,
      username: result.username as string,
      password: result.password as string,
      role: result.role as string,
      createdAt: result.created_at as string,
      updatedAt: result.updated_at as string
    };
  }

  static async create(env: Env, user: User): Promise<User> {
    const now = new Date().toISOString();
    
    await env.DB.prepare(`
      INSERT INTO users (id, username, password, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      user.username,
      user.password,
      user.role,
      now,
      now
    ).run();
    
    return { ...user, createdAt: now, updatedAt: now };
  }

  static async update(env: Env, id: string, user: Partial<User>): Promise<User> {
    const now = new Date().toISOString();
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (user.username !== undefined) {
      updates.push('username = ?');
      values.push(user.username);
    }
    if (user.password !== undefined) {
      updates.push('password = ?');
      values.push(user.password);
    }
    if (user.role !== undefined) {
      updates.push('role = ?');
      values.push(user.role);
    }
    
    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);
    
    await env.DB.prepare(`
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).bind(...values).run();
    
    const updatedUser = await this.getById(env, id);
    if (!updatedUser) throw new Error('User not found');
    
    return updatedUser;
  }
}