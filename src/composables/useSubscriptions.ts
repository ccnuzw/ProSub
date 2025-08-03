// 订阅管理组合式函数
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { useApi } from './useApi'
import type { Subscription } from '@shared/types'

export function useSubscriptions() {
  const { get, post, put, del, loading } = useApi()
  
  const subscriptions = ref<Subscription[]>([])
  const selectedSubscriptions = ref<string[]>([])
  const searchKeyword = ref('')
  const filterStatus = ref<string>('all')

  // 过滤后的订阅
  const filteredSubscriptions = computed(() => {
    let result = [...subscriptions.value]

    // 搜索过滤
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(sub => 
        sub.name.toLowerCase().includes(keyword) ||
        sub.url.toLowerCase().includes(keyword)
      )
    }

    // 状态过滤
    if (filterStatus.value !== 'all') {
      result = result.filter(sub => {
        if (filterStatus.value === 'error') {
          return sub.error !== null
        } else if (filterStatus.value === 'success') {
          return sub.error === null
        }
        return true
      })
    }

    return result
  })

  // 加载订阅列表
  const loadSubscriptions = async () => {
    const data = await get<Subscription[]>('/api/subscriptions')
    if (data) {
      subscriptions.value = data
    }
  }

  // 创建订阅
  const createSubscription = async (subscription: Omit<Subscription, 'id' | 'nodeCount' | 'lastUpdated' | 'error'>) => {
    const data = await post<Subscription>('/api/subscriptions', subscription, { showSuccess: true })
    if (data) {
      await loadSubscriptions()
      return data
    }
    return null
  }

  // 更新订阅
  const updateSubscription = async (id: string, subscription: Partial<Subscription>) => {
    const data = await put<Subscription>(`/api/subscriptions/${id}`, subscription, { showSuccess: true })
    if (data) {
      await loadSubscriptions()
      return data
    }
    return null
  }

  // 删除订阅
  const deleteSubscription = async (id: string) => {
    const success = await del(`/api/subscriptions/${id}`, { showSuccess: true })
    if (success !== null) {
      await loadSubscriptions()
      return true
    }
    return false
  }

  // 批量删除订阅
  const batchDeleteSubscriptions = async (ids: string[]) => {
    const success = await post('/api/subscriptions/batch-delete', { ids }, { showSuccess: true })
    if (success !== null) {
      await loadSubscriptions()
      selectedSubscriptions.value = []
      return true
    }
    return false
  }

  // 批量导入订阅
  const batchImportSubscriptions = async (subscriptionData: string) => {
    const success = await post('/api/subscriptions/batch-import', { data: subscriptionData }, { showSuccess: true })
    if (success !== null) {
      await loadSubscriptions()
      return true
    }
    return false
  }

  // 更新订阅内容
  const updateSubscriptionContent = async (id: string) => {
    const success = await put(`/api/subscriptions/${id}/update`, {}, { showSuccess: true })
    if (success !== null) {
      await loadSubscriptions()
      return true
    }
    return false
  }

  // 批量更新订阅
  const batchUpdateSubscriptions = async (ids?: string[]) => {
    const targetIds = ids || selectedSubscriptions.value
    if (targetIds.length === 0) {
      message.warning('请选择要更新的订阅')
      return false
    }

    const success = await post('/api/subscriptions/batch-update', { ids: targetIds }, { showSuccess: true })
    if (success !== null) {
      await loadSubscriptions()
      return true
    }
    return false
  }

  // 预览订阅内容
  const previewSubscription = async (id: string) => {
    const data = await get(`/api/subscriptions/preview/${id}`)
    return data
  }

  // 选择订阅
  const selectSubscription = (id: string) => {
    const index = selectedSubscriptions.value.indexOf(id)
    if (index > -1) {
      selectedSubscriptions.value.splice(index, 1)
    } else {
      selectedSubscriptions.value.push(id)
    }
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedSubscriptions.value.length === filteredSubscriptions.value.length) {
      selectedSubscriptions.value = []
    } else {
      selectedSubscriptions.value = filteredSubscriptions.value.map(sub => sub.id)
    }
  }

  return {
    // 状态
    subscriptions: computed(() => subscriptions.value),
    filteredSubscriptions,
    selectedSubscriptions: computed(() => selectedSubscriptions.value),
    searchKeyword,
    filterStatus,
    loading,

    // 方法
    loadSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    batchDeleteSubscriptions,
    batchImportSubscriptions,
    updateSubscriptionContent,
    batchUpdateSubscriptions,
    previewSubscription,
    selectSubscription,
    toggleSelectAll,
  }
} 