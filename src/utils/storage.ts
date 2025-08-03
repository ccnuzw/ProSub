// 前端存储工具函数

// 本地存储封装
export const storage = {
  // 设置值
  set(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Storage set error:', error)
    }
  },

  // 获取值
  get<T = any>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.error('Storage get error:', error)
      return defaultValue || null
    }
  },

  // 删除值
  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Storage remove error:', error)
    }
  },

  // 清空所有
  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Storage clear error:', error)
    }
  },

  // 检查是否存在
  has(key: string): boolean {
    return localStorage.getItem(key) !== null
  }
}

// 会话存储封装
export const sessionStorage = {
  // 设置值
  set(key: string, value: any): void {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('SessionStorage set error:', error)
    }
  },

  // 获取值
  get<T = any>(key: string, defaultValue?: T): T | null {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.error('SessionStorage get error:', error)
      return defaultValue || null
    }
  },

  // 删除值
  remove(key: string): void {
    try {
      window.sessionStorage.removeItem(key)
    } catch (error) {
      console.error('SessionStorage remove error:', error)
    }
  },

  // 清空所有
  clear(): void {
    try {
      window.sessionStorage.clear()
    } catch (error) {
      console.error('SessionStorage clear error:', error)
    }
  },

  // 检查是否存在
  has(key: string): boolean {
    return window.sessionStorage.getItem(key) !== null
  }
}

// 缓存管理
export const cache = {
  // 内存缓存
  memory: new Map<string, { value: any; timestamp: number; ttl: number }>(),

  // 设置缓存
  set(key: string, value: any, ttl: number = 5 * 60 * 1000): void {
    this.memory.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    })
  },

  // 获取缓存
  get<T = any>(key: string): T | null {
    const item = this.memory.get(key)
    if (!item) return null

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.memory.delete(key)
      return null
    }

    return item.value
  },

  // 删除缓存
  delete(key: string): void {
    this.memory.delete(key)
  },

  // 清空缓存
  clear(): void {
    this.memory.clear()
  }
} 