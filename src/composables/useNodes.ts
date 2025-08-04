// 节点管理组合式函数
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { useApi } from './useApi'
import type { Node, HealthStatus } from '@shared/types'

export function useNodes() {
  const nodes = ref<Node[]>([])
  const nodeStatus = ref<Record<string, HealthStatus>>({})
  const loading = ref(false)
  const { get, post, put, del, loading: apiLoading } = useApi()

  const fetchNodes = async () => {
    loading.value = true
    try {
      const response = await get('/api/nodes')
      if (response.success) {
        nodes.value = response.data
      }
    } catch (error) {
      console.error('获取节点列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchNodeStatus = async () => {
    try {
      const response = await get('/api/node-statuses')
      if (response.success) {
        nodeStatus.value = response.data
      }
    } catch (error) {
      console.error('获取节点状态失败:', error)
    }
  }

  const addNode = async (node: Node) => {
    try {
      const response = await post('/api/nodes', node)
      if (response.success) {
        await fetchNodes()
        return response.data
      }
    } catch (error) {
      console.error('添加节点失败:', error)
      throw error
    }
  }

  const updateNode = async (id: string, node: Partial<Node>) => {
    try {
      const response = await put(`/api/nodes/${id}`, node)
      if (response.success) {
        await fetchNodes()
        return response.data
      }
    } catch (error) {
      console.error('更新节点失败:', error)
      throw error
    }
  }

  const deleteNode = async (id: string) => {
    try {
      const response = await del(`/api/nodes/${id}`)
      if (response.success) {
        await fetchNodes()
        return true
      }
    } catch (error) {
      console.error('删除节点失败:', error)
      throw error
    }
  }

  const batchImport = async (nodes: Node[]) => {
    try {
      const response = await post('/api/nodes/batch-import', { nodes })
      if (response.success) {
        await fetchNodes()
        return response.data
      }
    } catch (error) {
      console.error('批量导入节点失败:', error)
      throw error
    }
  }

  const batchDelete = async (ids: string[]) => {
    try {
      const response = await post('/api/nodes/batch-delete', { ids })
      if (response.success) {
        await fetchNodes()
        return true
      }
    } catch (error) {
      console.error('批量删除节点失败:', error)
      throw error
    }
  }

  const checkHealth = async (ids?: string[]) => {
    try {
      const response = await post('/api/node-health-check', { 
        nodeIds: ids || nodes.value.map(node => node.id) 
      })
      if (response.success) {
        await fetchNodeStatus()
        return response.data
      }
    } catch (error) {
      console.error('健康检查失败:', error)
      throw error
    }
  }

  const clearAll = async () => {
    try {
      const response = await del('/api/nodes/clear-all')
      if (response.success) {
        await fetchNodes()
        return true
      }
    } catch (error) {
      console.error('清空所有节点失败:', error)
      throw error
    }
  }

  // 计算属性
  const filteredNodes = computed(() => {
    let result = nodes.value

    // 按类型筛选
    if (selectedType.value) {
      result = result.filter(node => node.type === selectedType.value)
    }

    // 按状态筛选
    if (selectedStatus.value) {
      result = result.filter(node => {
        const status = nodeStatus.value[node.id]
        return status && status.status === selectedStatus.value
      })
    }

    // 按关键词搜索
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(node => 
        node.name.toLowerCase().includes(keyword) ||
        node.server.toLowerCase().includes(keyword)
      )
    }

    return result
  })

  // 筛选状态
  const selectedType = ref('')
  const selectedStatus = ref('')
  const searchKeyword = ref('')

  return {
    nodes,
    nodeStatus,
    loading: computed(() => loading.value || apiLoading.value),
    filteredNodes,
    selectedType,
    selectedStatus,
    searchKeyword,
    fetchNodes,
    fetchNodeStatus,
    addNode,
    updateNode,
    deleteNode,
    batchImport,
    batchDelete,
    checkHealth,
    clearAll
  }
} 