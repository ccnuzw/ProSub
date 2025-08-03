// API调用组合式函数
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { getAuthToken, clearAuth } from '@/utils/auth'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

interface ApiOptions {
  showError?: boolean
  showSuccess?: boolean
  loading?: boolean
}

export function useApi() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 基础API调用函数
  const callApi = async <T>(
    url: string,
    options: RequestInit = {},
    apiOptions: ApiOptions = {}
  ): Promise<T | null> => {
    const { showError = true, showSuccess = false, loading: showLoading = true } = apiOptions
    
    if (showLoading) {
      loading.value = true
    }
    error.value = null

    try {
      const token = getAuthToken()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (response.status === 401) {
        clearAuth()
        window.location.href = '/login'
        return null
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result: ApiResponse<T> = await response.json()

      if (!result.success) {
        throw new Error(result.error || result.message || '请求失败')
      }

      if (showSuccess && result.message) {
        message.success(result.message)
      }

      return result.data || null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '请求失败'
      error.value = errorMessage
      
      if (showError) {
        message.error(errorMessage)
      }
      
      return null
    } finally {
      if (showLoading) {
        loading.value = false
      }
    }
  }

  // GET请求
  const get = <T>(url: string, options?: ApiOptions) => {
    return callApi<T>(url, { method: 'GET' }, options)
  }

  // POST请求
  const post = <T>(url: string, data?: any, options?: ApiOptions) => {
    return callApi<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, options)
  }

  // PUT请求
  const put = <T>(url: string, data?: any, options?: ApiOptions) => {
    return callApi<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, options)
  }

  // DELETE请求
  const del = <T>(url: string, options?: ApiOptions) => {
    return callApi<T>(url, { method: 'DELETE' }, options)
  }

  // 批量操作
  const batch = async <T>(
    operations: Array<{ url: string; method: string; data?: any }>,
    options?: ApiOptions
  ): Promise<T[]> => {
    const results: T[] = []
    
    for (const operation of operations) {
      const result = await callApi<T>(
        operation.url,
        {
          method: operation.method as any,
          body: operation.data ? JSON.stringify(operation.data) : undefined,
        },
        { ...options, loading: false }
      )
      
      if (result !== null) {
        results.push(result)
      }
    }
    
    return results
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    get,
    post,
    put,
    del,
    batch,
    callApi,
  }
} 