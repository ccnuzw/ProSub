// 速率限制工具
import { Env } from '@shared/types'

export interface RateLimitConfig {
  windowMs: number // 时间窗口（毫秒）
  maxRequests: number // 最大请求数
  keyGenerator?: (request: Request) => string // 自定义键生成器
}

export class RateLimiter {
  private static readonly RATE_LIMIT_PREFIX = 'rate_limit:'
  private static readonly DEFAULT_WINDOW_MS = 60 * 1000 // 1分钟
  private static readonly DEFAULT_MAX_REQUESTS = 100 // 默认100次请求

  // 生成速率限制键
  private static getRateLimitKey(identifier: string, windowStart: number): string {
    return `${this.RATE_LIMIT_PREFIX}${identifier}:${windowStart}`
  }

  // 获取客户端标识符
  private static getClientIdentifier(request: Request): string {
    // 优先使用X-Forwarded-For，然后是CF-Connecting-IP
    const forwardedFor = request.headers.get('X-Forwarded-For')
    const cfConnectingIP = request.headers.get('CF-Connecting-IP')
    const realIP = request.headers.get('X-Real-IP')
    
    return forwardedFor?.split(',')[0] || cfConnectingIP || realIP || 'unknown'
  }

  // 检查速率限制
  static async checkRateLimit(
    env: Env,
    request: Request,
    config: RateLimitConfig = {}
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const {
      windowMs = this.DEFAULT_WINDOW_MS,
      maxRequests = this.DEFAULT_MAX_REQUESTS,
      keyGenerator
    } = config

    const identifier = keyGenerator ? keyGenerator(request) : this.getClientIdentifier(request)
    const now = Date.now()
    const windowStart = Math.floor(now / windowMs) * windowMs
    const key = this.getRateLimitKey(identifier, windowStart)

    try {
      // 获取当前窗口的请求数
      const currentCount = await env.KV.get(key)
      const count = currentCount ? parseInt(currentCount) : 0

      if (count >= maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: windowStart + windowMs
        }
      }

      // 增加计数
      await env.KV.put(key, (count + 1).toString(), {
        expirationTtl: Math.ceil(windowMs / 1000) + 60 // 添加60秒缓冲
      })

      return {
        allowed: true,
        remaining: maxRequests - count - 1,
        resetTime: windowStart + windowMs
      }
    } catch (error) {
      console.error('Rate limit check error:', error)
      // 出错时允许请求通过
      return {
        allowed: true,
        remaining: maxRequests,
        resetTime: windowStart + windowMs
      }
    }
  }

  // 获取速率限制信息
  static async getRateLimitInfo(
    env: Env,
    request: Request,
    config: RateLimitConfig = {}
  ): Promise<{ current: number; limit: number; remaining: number; resetTime: number }> {
    const {
      windowMs = this.DEFAULT_WINDOW_MS,
      maxRequests = this.DEFAULT_MAX_REQUESTS,
      keyGenerator
    } = config

    const identifier = keyGenerator ? keyGenerator(request) : this.getClientIdentifier(request)
    const now = Date.now()
    const windowStart = Math.floor(now / windowMs) * windowMs
    const key = this.getRateLimitKey(identifier, windowStart)

    try {
      const currentCount = await env.KV.get(key)
      const count = currentCount ? parseInt(currentCount) : 0

      return {
        current: count,
        limit: maxRequests,
        remaining: Math.max(0, maxRequests - count),
        resetTime: windowStart + windowMs
      }
    } catch (error) {
      console.error('Rate limit info error:', error)
      return {
        current: 0,
        limit: maxRequests,
        remaining: maxRequests,
        resetTime: windowStart + windowMs
      }
    }
  }

  // 重置速率限制
  static async resetRateLimit(env: Env, request: Request, config: RateLimitConfig = {}): Promise<void> {
    const {
      windowMs = this.DEFAULT_WINDOW_MS,
      keyGenerator
    } = config

    const identifier = keyGenerator ? keyGenerator(request) : this.getClientIdentifier(request)
    const now = Date.now()
    const windowStart = Math.floor(now / windowMs) * windowMs
    const key = this.getRateLimitKey(identifier, windowStart)

    try {
      await env.KV.delete(key)
    } catch (error) {
      console.error('Rate limit reset error:', error)
    }
  }
}

// 预定义的速率限制配置
export const RateLimitConfigs = {
  // API请求限制
  API: {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 100
  },
  
  // 订阅更新限制
  SUBSCRIPTION_UPDATE: {
    windowMs: 5 * 60 * 1000, // 5分钟
    maxRequests: 10
  },
  
  // 健康检查限制
  HEALTH_CHECK: {
    windowMs: 30 * 1000, // 30秒
    maxRequests: 50
  },
  
  // 登录限制
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 5
  },
  
  // 订阅访问限制
  SUBSCRIPTION_ACCESS: {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 1000
  }
}

// 速率限制中间件
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return async (request: Request, env: Env) => {
    const rateLimitResult = await RateLimiter.checkRateLimit(env, request, config)
    
    if (!rateLimitResult.allowed) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Rate limit exceeded',
        message: '请求过于频繁，请稍后再试'
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
        }
      })
    }

    // 添加速率限制头信息
    const response = new Response()
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())
    
    return response
  }
} 