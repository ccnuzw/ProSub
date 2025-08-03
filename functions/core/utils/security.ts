// 安全工具函数
import { Env } from '@shared/types'
import { RateLimiter, RateLimitConfigs } from './rate-limiter'

export interface SecurityConfig {
  enableRateLimit: boolean
  enableCORS: boolean
  enableCSP: boolean
  enableHSTS: boolean
  maxRequestSize: number
}

export class SecurityManager {
  private static readonly DEFAULT_CONFIG: SecurityConfig = {
    enableRateLimit: true,
    enableCORS: true,
    enableCSP: true,
    enableHSTS: true,
    maxRequestSize: 10 * 1024 * 1024 // 10MB
  }

  // 添加安全头
  static addSecurityHeaders(response: Response, config: Partial<SecurityConfig> = {}): Response {
    const securityConfig = { ...this.DEFAULT_CONFIG, ...config }
    
    if (securityConfig.enableCORS) {
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      response.headers.set('Access-Control-Max-Age', '86400')
    }

    if (securityConfig.enableCSP) {
      response.headers.set('Content-Security-Policy', 
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
      )
    }

    if (securityConfig.enableHSTS) {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    }

    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    return response
  }

  // 检查请求大小
  static async checkRequestSize(request: Request, maxSize: number = this.DEFAULT_CONFIG.maxRequestSize): Promise<boolean> {
    const contentLength = request.headers.get('content-length')
    if (contentLength) {
      const size = parseInt(contentLength)
      return size <= maxSize
    }
    return true
  }

  // 验证订阅URL安全性
  static validateSubscriptionURL(url: string): { isValid: boolean; reason?: string } {
    try {
      const urlObj = new URL(url)
      
      // 检查协议
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return { isValid: false, reason: '只支持 HTTP 和 HTTPS 协议' }
      }

      // 检查域名
      const hostname = urlObj.hostname.toLowerCase()
      const blacklistedDomains = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '::1'
      ]
      
      if (blacklistedDomains.includes(hostname)) {
        return { isValid: false, reason: '不允许使用本地地址' }
      }

      // 检查端口
      const port = urlObj.port
      if (port && (parseInt(port) < 1 || parseInt(port) > 65535)) {
        return { isValid: false, reason: '端口号无效' }
      }

      return { isValid: true }
    } catch (error) {
      return { isValid: false, reason: 'URL 格式无效' }
    }
  }

  // 生成安全的随机字符串
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(array[i] % chars.length)
    }
    
    return result
  }

  // 生成订阅访问令牌
  static generateSubscriptionToken(subscriptionId: string, userId: string): string {
    const payload = {
      sub: subscriptionId,
      user: userId,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24小时过期
      iat: Math.floor(Date.now() / 1000)
    }
    
    // 这里应该使用JWT，但为了简化，我们使用简单的编码
    return btoa(JSON.stringify(payload))
  }

  // 验证订阅访问令牌
  static validateSubscriptionToken(token: string): { isValid: boolean; payload?: any } {
    try {
      const payload = JSON.parse(atob(token))
      const now = Math.floor(Date.now() / 1000)
      
      if (payload.exp && payload.exp < now) {
        return { isValid: false }
      }
      
      return { isValid: true, payload }
    } catch (error) {
      return { isValid: false }
    }
  }

  // 检查IP地址是否被阻止
  static async isIPBlocked(env: Env, ip: string): Promise<boolean> {
    const blockedKey = `blocked_ip:${ip}`
    const blocked = await env.KV.get(blockedKey)
    return !!blocked
  }

  // 阻止IP地址
  static async blockIP(env: Env, ip: string, duration: number = 3600): Promise<void> {
    const blockedKey = `blocked_ip:${ip}`
    await env.KV.put(blockedKey, 'blocked', { expirationTtl: duration })
  }

  // 记录安全事件
  static async logSecurityEvent(env: Env, event: {
    type: string
    ip: string
    userAgent?: string
    details?: any
  }): Promise<void> {
    const logKey = `security_log:${Date.now()}:${event.type}`
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...event
    }
    
    await env.KV.put(logKey, JSON.stringify(logEntry), { expirationTtl: 86400 * 30 }) // 30天
  }

  // 检查请求频率
  static async checkRequestFrequency(env: Env, request: Request, config: any = RateLimitConfigs.API): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
  }> {
    return await RateLimiter.checkRateLimit(env, request, config)
  }

  // 清理过期的安全数据
  static async cleanupSecurityData(env: Env): Promise<void> {
    // 这里可以实现清理过期数据的逻辑
    // 由于KV的限制，我们只能通过TTL自动清理
    console.log('Security data cleanup completed')
  }
}

// 安全中间件
export function createSecurityMiddleware(config: Partial<SecurityConfig> = {}) {
  return async (request: Request, env: Env) => {
    const securityConfig = { ...SecurityManager.DEFAULT_CONFIG, ...config }
    
    // 检查请求大小
    if (!await SecurityManager.checkRequestSize(request, securityConfig.maxRequestSize)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Request too large',
        message: '请求数据过大'
      }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 检查IP是否被阻止
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown'
    if (await SecurityManager.isIPBlocked(env, clientIP)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'IP blocked',
        message: 'IP地址已被阻止'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 检查请求频率
    if (securityConfig.enableRateLimit) {
      const rateLimitResult = await SecurityManager.checkRequestFrequency(env, request)
      if (!rateLimitResult.allowed) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Rate limit exceeded',
          message: '请求过于频繁，请稍后再试'
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        })
      }
    }

    return null // 继续处理请求
  }
} 