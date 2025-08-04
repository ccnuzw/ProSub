// API调用组合式函数
import { ref } from 'vue'
import { message } from 'ant-design-vue'

export function useApi() {
  const loading = ref(false)

  const getToken = () => {
    // 从localStorage或cookie中获取token
    return localStorage.getItem('token')
  }

  const setToken = (token: string) => {
    localStorage.setItem('token', token)
  }

  const removeToken = () => {
    localStorage.removeItem('token')
  }

  const request = async (url: string, options: RequestInit = {}) => {
    loading.value = true
    
    try {
      const token = getToken()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(url, {
        ...options,
        headers
      })

      if (!response.ok) {
        if (response.status === 401) {
          removeToken()
          window.location.href = '/login'
          return null
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API请求失败:', error)
      message.error('请求失败，请稍后重试')
      return null
    } finally {
      loading.value = false
    }
  }

  const get = async <T = any>(url: string): Promise<T | null> => {
    return request(url, { method: 'GET' })
  }

  const post = async <T = any>(url: string, data?: any): Promise<T | null> => {
    return request(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  const put = async <T = any>(url: string, data?: any): Promise<T | null> => {
    return request(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  const del = async <T = any>(url: string): Promise<T | null> => {
    return request(url, { method: 'DELETE' })
  }

  return {
    get,
    post,
    put,
    del,
    loading
  }
} 