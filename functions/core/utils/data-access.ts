import { Node, Subscription, Env } from '@shared/types';

// 节点数据访问
export class NodeDataAccess {
  private static readonly ALL_NODES_KEY = 'ALL_NODES';

  static async getAll(env: Env): Promise<Record<string, Node>> {
    const nodesJson = await env.KV.get(this.ALL_NODES_KEY);
    return nodesJson ? JSON.parse(nodesJson) : {};
  }

  static async putAll(env: Env, nodes: Record<string, Node>): Promise<void> {
    await env.KV.put(this.ALL_NODES_KEY, JSON.stringify(nodes));
  }

  static async getById(env: Env, id: string): Promise<Node | null> {
    const allNodes = await this.getAll(env);
    return allNodes[id] || null;
  }

  static async create(env: Env, node: Node): Promise<Node> {
    const allNodes = await this.getAll(env);
    allNodes[node.id] = node;
    await this.putAll(env, allNodes);
    return node;
  }

  static async update(env: Env, id: string, node: Node): Promise<Node> {
    const allNodes = await this.getAll(env);
    if (!allNodes[id]) {
      throw new Error('节点不存在');
    }
    allNodes[id] = node;
    await this.putAll(env, allNodes);
    return node;
  }

  static async delete(env: Env, id: string): Promise<void> {
    const allNodes = await this.getAll(env);
    if (!allNodes[id]) {
      throw new Error('节点不存在');
    }
    delete allNodes[id];
    await this.putAll(env, allNodes);
  }

  static async clearAll(env: Env): Promise<void> {
    await this.putAll(env, {});
  }

  static async batchDelete(env: Env, ids: string[]): Promise<number> {
    const allNodes = await this.getAll(env);
    let deletedCount = 0;
    
    for (const id of ids) {
      if (allNodes[id]) {
        delete allNodes[id];
        deletedCount++;
      }
    }
    
    await this.putAll(env, allNodes);
    return deletedCount;
  }
}

// 订阅数据访问
export class SubscriptionDataAccess {
  private static readonly ALL_SUBSCRIPTIONS_KEY = 'ALL_SUBSCRIPTIONS';

  static async getAll(env: Env): Promise<Record<string, Subscription>> {
    const subsJson = await env.KV.get(this.ALL_SUBSCRIPTIONS_KEY);
    return subsJson ? JSON.parse(subsJson) : {};
  }

  static async putAll(env: Env, subscriptions: Record<string, Subscription>): Promise<void> {
    await env.KV.put(this.ALL_SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
  }

  static async getById(env: Env, id: string): Promise<Subscription | null> {
    const allSubscriptions = await this.getAll(env);
    return allSubscriptions[id] || null;
  }

  static async create(env: Env, subscription: Subscription): Promise<Subscription> {
    const allSubscriptions = await this.getAll(env);
    allSubscriptions[subscription.id] = subscription;
    await this.putAll(env, allSubscriptions);
    return subscription;
  }

  static async update(env: Env, id: string, subscription: Subscription): Promise<Subscription> {
    const allSubscriptions = await this.getAll(env);
    if (!allSubscriptions[id]) {
      throw new Error('订阅不存在');
    }
    allSubscriptions[id] = subscription;
    await this.putAll(env, allSubscriptions);
    return subscription;
  }

  static async delete(env: Env, id: string): Promise<void> {
    const allSubscriptions = await this.getAll(env);
    if (!allSubscriptions[id]) {
      throw new Error('订阅不存在');
    }
    delete allSubscriptions[id];
    await this.putAll(env, allSubscriptions);
  }

  static async updateStatus(env: Env, id: string, nodeCount: number, error?: string): Promise<Subscription> {
    const allSubscriptions = await this.getAll(env);
    const subscription = allSubscriptions[id];
    
    if (!subscription) {
      throw new Error('订阅不存在');
    }

    subscription.nodeCount = nodeCount;
    subscription.lastUpdated = new Date().toISOString();
    subscription.error = error;
    
    await this.putAll(env, allSubscriptions);
    return subscription;
  }
} 