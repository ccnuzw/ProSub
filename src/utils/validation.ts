// 前端验证工具函数

// 验证邮箱
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证URL
export function isValidURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// 验证端口号
export function isValidPort(port: number): boolean {
  return port >= 1 && port <= 65535
}

// 验证IP地址
export function isValidIP(ip: string): boolean {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return ipRegex.test(ip)
}

// 验证域名
export function isValidDomain(domain: string): boolean {
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return domainRegex.test(domain)
}

// 验证UUID
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// 验证Base64
export function isValidBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str
  } catch {
    return false
  }
}

// 验证节点名称
export function isValidNodeName(name: string): boolean {
  return name.length >= 1 && name.length <= 50
}

// 验证服务器地址
export function isValidServer(server: string): boolean {
  return isValidIP(server) || isValidDomain(server)
}

// 验证密码强度
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  let score = 0
  
  // 长度检查
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  
  // 字符类型检查
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  
  if (score <= 2) return 'weak'
  if (score <= 4) return 'medium'
  return 'strong'
}

// 验证订阅URL
export function isValidSubscriptionURL(url: string): boolean {
  if (!isValidURL(url)) return false
  
  const urlObj = new URL(url)
  const protocol = urlObj.protocol
  
  // 只允许http和https协议
  if (protocol !== 'http:' && protocol !== 'https:') return false
  
  return true
}

// 验证节点配置
export function validateNodeConfig(config: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!config.name || !isValidNodeName(config.name)) {
    errors.push('节点名称无效')
  }
  
  if (!config.server || !isValidServer(config.server)) {
    errors.push('服务器地址无效')
  }
  
  if (!config.port || !isValidPort(config.port)) {
    errors.push('端口号无效')
  }
  
  if (!config.type) {
    errors.push('节点类型不能为空')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// 验证订阅配置
export function validateSubscriptionConfig(config: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!config.name || config.name.trim().length === 0) {
    errors.push('订阅名称不能为空')
  }
  
  if (!config.url || !isValidSubscriptionURL(config.url)) {
    errors.push('订阅URL无效')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// 验证配置文件
export function validateProfileConfig(config: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!config.name || config.name.trim().length === 0) {
    errors.push('配置文件名称不能为空')
  }
  
  if (!config.clientType) {
    errors.push('客户端类型不能为空')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
} 