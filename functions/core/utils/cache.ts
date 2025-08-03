// 缓存管理工具
import { Env } from '@shared/types'

export interface CacheItem<T = any> {
  data: T
  timestamp: number
  ttl: number
}

export class CacheManager {
  private static readonly CACHE_PREFIX = 'cache:'
  private static readonly DEFAULT_TTL = 5 * 60 * 1000 // 5分钟

  // 生成缓存键
  private static getCacheKey(key: string): string {
    return `${this.CACHE_PREFIX}${key}`
  }

  // 设置缓存
  static async set<T>(env: Env, key: string, data: T, ttl: number = this.DEFAULT_TTL): Promise<void> {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl
    }
    
    await env.KV.put(this.getCacheKey(key), JSON.stringify(cacheItem), {
      expirationTtl: Math.ceil(ttl / 1000) // 转换为秒
    })
  }

  // 获取缓存
  static async get<T>(env: Env, key: string): Promise<T | null> {
    try {
      const cacheJson = await env.KV.get(this.getCacheKey(key))
      if (!cacheJson) return null

      const cacheItem: CacheItem<T> = JSON.parse(cacheJson)
      
      // 检查是否过期
      if (Date.now() - cacheItem.timestamp > cacheItem.ttl) {
        await this.delete(env, key)
        return null
      }

      return cacheItem.data
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  // 删除缓存
  static async delete(env: Env, key: string): Promise<void> {
    await env.KV.delete(this.getCacheKey(key))
  }

  // 清空所有缓存
  static async clear(env: Env): Promise<void> {
    // 注意：KV不支持批量删除，这里只是示例
    // 实际使用时需要记录所有缓存键或使用其他策略
    console.log('Cache clear called - KV does not support bulk delete')
  }

  // 检查缓存是否存在且有效
  static async has(env: Env, key: string): Promise<boolean> {
    const data = await this.get(env, key)
    return data !== null
  }

  // 获取缓存统计信息
  static async getStats(env: Env): Promise<{ total: number; expired: number }> {
    // 注意：KV不支持列出所有键，这里只是示例
    return { total: 0, expired: 0 }
  }
}

// 节点健康检查缓存
export class NodeHealthCache {
  private static readonly HEALTH_CACHE_PREFIX = 'health:'
  private static readonly HEALTH_CACHE_TTL = 2 * 60 * 1000 // 2分钟

  static async getHealthStatus(env: Env, nodeId: string) {
    return CacheManager.get(env, `${this.HEALTH_CACHE_PREFIX}${nodeId}`)
  }

  static async setHealthStatus(env: Env, nodeId: string, status: any) {
    return CacheManager.set(env, `${this.HEALTH_CACHE_PREFIX}${nodeId}`, status, this.HEALTH_CACHE_TTL)
  }
}

// 订阅内容缓存
export class SubscriptionCache {
  private static readonly SUBSCRIPTION_CACHE_PREFIX = 'sub:'
  private static readonly SUBSCRIPTION_CACHE_TTL = 10 * 60 * 1000 // 10分钟

  static async getSubscriptionContent(env: Env, subscriptionId: string) {
    return CacheManager.get(env, `${this.SUBSCRIPTION_CACHE_PREFIX}${subscriptionId}`)
  }

  static async setSubscriptionContent(env: Env, subscriptionId: string, content: any) {
    return CacheManager.set(env, `${this.SUBSCRIPTION_CACHE_PREFIX}${subscriptionId}`, content, this.SUBSCRIPTION_CACHE_TTL)
  }
}

// 统计数据缓存
export class StatsCache {
  private static readonly STATS_CACHE_PREFIX = 'stats:'
  private static readonly STATS_CACHE_TTL = 5 * 60 * 1000 // 5分钟

  static async getStats(env: Env, type: string) {
    return CacheManager.get(env, `${this.STATS_CACHE_PREFIX}${type}`)
  }

  static async setStats(env: Env, type: string, stats: any) {
    return CacheManager.set(env, `${this.STATS_CACHE_PREFIX}${type}`, stats, this.STATS_CACHE_TTL)
  }
} 