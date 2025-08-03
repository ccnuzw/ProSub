// 节点管理组合式函数
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { useApi } from './useApi'
import type { Node } from '@shared/types'

export function useNodes() {
  const { get, post, put, del, batch, loading } = useApi()
  
  const nodes = ref<Node[]>([])
  const selectedNodes = ref<string[]>([])
  const searchKeyword = ref('')
  const filterType = ref<string>('all')
  const filterStatus = ref<string>('all')
  const sortBy = ref<string>('name')
  const sortOrder = ref<'asc' | 'desc'>('asc')

  // 过滤和排序后的节点
  const filteredNodes = computed(() => {
    let result = [...nodes.value]

    // 搜索过滤
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(node => 
        node.name.toLowerCase().includes(keyword) ||
        node.server.toLowerCase().includes(keyword) ||
        node.type.toLowerCase().includes(keyword)
      )
    }

    // 类型过滤
    if (filterType.value !== 'all') {
      result = result.filter(node => node.type === filterType.value)
    }

    // 状态过滤
    if (filterStatus.value !== 'all') {
      result = result.filter(node => {
        // 这里需要根据实际的节点状态字段进行调整
        return true // 暂时返回所有节点
      })
    }

    // 排序
    result.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy.value) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'server':
          aValue = a.server
          bValue = b.server
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        case 'port':
          aValue = a.port
          bValue = b.port
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      if (sortOrder.value === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return result
  })

  // 加载节点列表
  const loadNodes = async () => {
    const data = await get<Node[]>('/api/nodes')
    if (data) {
      nodes.value = data
    }
  }

  // 创建节点
  const createNode = async (node: Omit<Node, 'id'>) => {
    const data = await post<Node>('/api/nodes', node, { showSuccess: true })
    if (data) {
      await loadNodes()
      return data
    }
    return null
  }

  // 更新节点
  const updateNode = async (id: string, node: Partial<Node>) => {
    const data = await put<Node>(`/api/nodes/${id}`, node, { showSuccess: true })
    if (data) {
      await loadNodes()
      return data
    }
    return null
  }

  // 删除节点
  const deleteNode = async (id: string) => {
    const success = await del(`/api/nodes/${id}`, { showSuccess: true })
    if (success !== null) {
      await loadNodes()
      return true
    }
    return false
  }

  // 批量删除节点
  const batchDeleteNodes = async (ids: string[]) => {
    const success = await post('/api/nodes/batch-delete', { ids }, { showSuccess: true })
    if (success !== null) {
      await loadNodes()
      selectedNodes.value = []
      return true
    }
    return false
  }

  // 批量导入节点
  const batchImportNodes = async (nodeData: string) => {
    const success = await post('/api/nodes/batch-import', { data: nodeData }, { showSuccess: true })
    if (success !== null) {
      await loadNodes()
      return true
    }
    return false
  }

  // 清空所有节点
  const clearAllNodes = async () => {
    const success = await del('/api/nodes/clear-all', { showSuccess: true })
    if (success !== null) {
      await loadNodes()
      return true
    }
    return false
  }

  // 健康检查
  const healthCheck = async (ids?: string[]) => {
    const targetIds = ids || selectedNodes.value
    if (targetIds.length === 0) {
      message.warning('请选择要检查的节点')
      return false
    }

    const success = await post('/api/utility/node-health-check', { ids: targetIds }, { showSuccess: true })
    if (success !== null) {
      await loadNodes() // 重新加载以获取最新状态
      return true
    }
    return false
  }

  // 选择节点
  const selectNode = (id: string) => {
    const index = selectedNodes.value.indexOf(id)
    if (index > -1) {
      selectedNodes.value.splice(index, 1)
    } else {
      selectedNodes.value.push(id)
    }
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedNodes.value.length === filteredNodes.value.length) {
      selectedNodes.value = []
    } else {
      selectedNodes.value = filteredNodes.value.map(node => node.id)
    }
  }

  // 设置排序
  const setSort = (field: string) => {
    if (sortBy.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = field
      sortOrder.value = 'asc'
    }
  }

  return {
    // 状态
    nodes: computed(() => nodes.value),
    filteredNodes,
    selectedNodes: computed(() => selectedNodes.value),
    searchKeyword,
    filterType,
    filterStatus,
    sortBy,
    sortOrder,
    loading,

    // 方法
    loadNodes,
    createNode,
    updateNode,
    deleteNode,
    batchDeleteNodes,
    batchImportNodes,
    clearAllNodes,
    healthCheck,
    selectNode,
    toggleSelectAll,
    setSort,
  }
} 