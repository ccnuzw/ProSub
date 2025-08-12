<template>
  <div class="nodes-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">节点管理</h1>
        <p class="page-subtitle">管理您的代理节点</p>
      </div>
      <div class="header-actions">
        <a-button type="default" @click="handleCheckAllNodes" :loading="checkingAll">
          <template #icon><ReloadOutlined /></template>
          检查所有节点
        </a-button>
        <a-button type="default" @click="exportNodes">
          <template #icon><DownloadOutlined /></template>
          导出节点
        </a-button>
        <a-button type="primary" @click="showImportModal">
          <template #icon><ImportOutlined /></template>
          导入节点
        </a-button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic
              title="总节点数"
              :value="nodes.length"
              :value-style="{ color: '#3f8600' }"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic
              title="在线节点"
              :value="onlineNodesCount"
              :value-style="{ color: '#52c41a' }"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic
              title="离线节点"
              :value="offlineNodesCount"
              :value-style="{ color: '#cf1322' }"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic
              title="平均延迟"
              :value="averageLatency"
              suffix="ms"
              :value-style="{ color: '#1890ff' }"
            />
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <a-row :gutter="16" align="middle">
        <a-col :span="8">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索节点名称或服务器地址"
            @search="handleSearch"
            allow-clear
          />
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="statusFilter"
            placeholder="状态筛选"
            style="width: 100%"
            allow-clear
          >
            <a-select-option value="online">在线</a-select-option>
            <a-select-option value="offline">离线</a-select-option>
            <a-select-option value="checking">检查中</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="typeFilter"
            placeholder="类型筛选"
            style="width: 100%"
            allow-clear
          >
            <a-select-option value="vmess">VMess</a-select-option>
            <a-select-option value="vless">VLESS</a-select-option>
            <a-select-option value="trojan">Trojan</a-select-option>
            <a-select-option value="ss">Shadowsocks</a-select-option>
            <a-select-option value="ssr">ShadowsocksR</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="8">
          <a-space>
            <a-button @click="handleClearFilters">清除筛选</a-button>
            <a-button type="primary" @click="handleBatchDelete" :disabled="selectedRowKeys.length === 0">
              批量删除
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <!-- 节点列表 -->
    <div class="nodes-content">
      <a-table
        :columns="columns"
        :data-source="filteredNodes"
        :loading="loading"
        :pagination="{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: filteredNodes.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
        }"
        :row-selection="rowSelection"
        row-key="id"
        class="nodes-table"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :class="['status-tag', `status-${getStatusClass(record.id)}`]">
              {{ getStatusText(record.id) }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'type'">
            <a-tag :class="['type-tag', `type-${record.type}`]">
              {{ getTypeText(record.type) }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button type="text" size="small" @click="handleCheck(record)" :loading="isChecking(record.id)" class="action-button">
                <template #icon><ReloadOutlined /></template>
                检查
              </a-button>
              <a-popconfirm
                title="确定要删除这个节点吗？"
                @confirm="handleDelete(record.id)"
                ok-text="确定"
                cancel-text="取消"
              >
                <a-button type="text" size="small" danger class="action-button">
                  <template #icon><DeleteOutlined /></template>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 批量导入模态框 -->
    <NodeImportModal ref="nodeImportModalRef" @import="handleBatchImport" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, h } from 'vue'
import { message } from 'ant-design-vue'
import {
  ReloadOutlined,
  ImportOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'
import type { Node, HealthStatus } from '@shared/types'
import { parseNodeLink } from '@shared/node-parser'
import NodeImportModal from '../components/NodeImportModal.vue'

// 响应式数据
const loading = ref(false)
const checkingAll = ref(false)
const importing = ref(false)

const nodes = ref<Node[]>([])
const nodeStatus = ref<Record<string, HealthStatus>>({})

const nodeImportModalRef = ref()

// 搜索和筛选
const searchText = ref('')
const statusFilter = ref<string>('')
const typeFilter = ref<string>('')

// 分页
const pagination = ref({
  current: 1,
  pageSize: 10
})

// 选择的行
const selectedRowKeys = ref<string[]>([])

// 统计信息计算
const onlineNodesCount = computed(() => {
  return Object.values(nodeStatus.value).filter(status => status.status === 'online').length
})

const offlineNodesCount = computed(() => {
  return Object.values(nodeStatus.value).filter(status => status.status === 'offline').length
})

const averageLatency = computed(() => {
  const onlineNodes = Object.values(nodeStatus.value).filter(status => status.status === 'online' && status.latency)
  if (onlineNodes.length === 0) return 0
  const totalLatency = onlineNodes.reduce((sum, status) => sum + (status.latency || 0), 0)
  return Math.round(totalLatency / onlineNodes.length)
})

// 筛选后的节点
const filteredNodes = computed(() => {
  let result = nodes.value

  // 搜索筛选
  if (searchText.value) {
    const searchLower = searchText.value.toLowerCase()
    result = result.filter(node => 
      node.name.toLowerCase().includes(searchLower) ||
      node.server.toLowerCase().includes(searchLower)
    )
  }

  // 状态筛选
  if (statusFilter.value) {
    result = result.filter(node => {
      const status = nodeStatus.value[node.id]
      return status && status.status === statusFilter.value
    })
  }

  // 类型筛选
  if (typeFilter.value) {
    result = result.filter(node => node.type === typeFilter.value)
  }

  return result
})

// 表格列定义
const columns = [
  {
    title: '序号',
    key: 'index',
    width: 60,
    customRender: ({ index }: { index: number }) => {
      const currentPage = pagination.value.current;
      const pageSize = pagination.value.pageSize;
      return (currentPage - 1) * pageSize + index + 1;
    }
  },
  {
    title: '节点名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '服务器',
    dataIndex: 'server',
    key: 'server'
  },
  {
    title: '端口',
    dataIndex: 'port',
    key: 'port'
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: '状态',
    key: 'status',
    customRender: ({ record }: { record: Node }) => {
      const status = nodeStatus.value[record.id]
      if (!status) {
        return h('a-tag', { color: 'default' }, '未知')
      }
      
      let color = 'default'
      let text = '未知'
      
      if (status.status === 'offline') {
        color = 'error'
        text = '离线'
      } else if (status.status === 'checking') {
        color = 'processing'
        text = '检查中'
      } else if (status.status === 'online') {
        color = 'success'
        text = status.latency ? `${status.latency}ms` : '在线'
      } else if (status.status === 'unknown') {
        color = 'default'
        text = '未知'
      }
      
      return h('a-tag', { color }, text)
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 200
  }
]

// 表格行选择配置
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys
  },
  getCheckboxProps: (record: Node) => ({
    disabled: false
  })
}))

// 方法
const fetchData = async () => {
  loading.value = true
  try {
    const [nodesRes, statusesRes] = await Promise.all([
      fetch('/api/nodes'),
      fetch('/api/node-statuses')
    ])
    
    if (nodesRes.ok) {
      nodes.value = await nodesRes.json()
    }
    
    if (statusesRes.ok) {
      nodeStatus.value = await statusesRes.json()
    }
  } catch (error) {
    console.error('获取节点数据失败:', error)
    message.error('获取节点数据失败')
  } finally {
    loading.value = false
  }
}

const getStatusColor = (id: string) => {
  const status = nodeStatus.value[id]
  if (!status) return 'default'
  if (status.status === 'offline') return 'error'
  if (status.status === 'checking') return 'processing'
  return 'success'
}

const getStatusClass = (id: string) => {
  const status = nodeStatus.value[id]
  if (!status) return 'unknown'
  return status.status
}

const getStatusText = (id: string) => {
  const status = nodeStatus.value[id]
  if (!status) return '未知'
  if (status.status === 'offline') return '离线'
  if (status.status === 'checking') return '检查中'
  if (status.status === 'online') {
    return status.latency ? `${status.latency}ms` : '在线'
  }
  return '未知'
}

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    vmess: 'blue',
    vless: 'green',
    trojan: 'purple',
    ss: 'orange',
    ssr: 'red'
  }
  return colorMap[type] || 'default'
}

const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    vmess: 'VMess',
    vless: 'VLESS',
    trojan: 'Trojan',
    ss: 'Shadowsocks',
    ssr: 'ShadowsocksR'
  }
  return typeMap[type] || type
}

const isChecking = (id: string) => {
  const status = nodeStatus.value[id]
  return status ? status.status === 'checking' : false
}

const handleSearch = () => {
  // 搜索功能已通过计算属性实现
}

const handleClearFilters = () => {
  searchText.value = ''
  statusFilter.value = ''
  typeFilter.value = ''
}

const handleTableChange = (pag: any) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
}

const handleBatchDelete = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的节点')
    return
  }

  try {
    const response = await fetch('/api/nodes/batch-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedRowKeys.value })
    })

    if (response.ok) {
      const result = await response.json()
      message.success(result.message || `成功删除 ${selectedRowKeys.value.length} 个节点`)
      selectedRowKeys.value = []
      await fetchData()
    } else {
      const errorData = await response.json()
      message.error(errorData.message || '批量删除失败')
    }
  } catch (error) {
    console.error('批量删除失败:', error)
    message.error('批量删除失败')
  }
}

const handleCheck = async (record: Node) => {
  try {
    const response = await fetch(`/api/node-health-check/${record.id}`, {
      method: 'POST'
    })
    
    if (response.ok) {
      message.success('节点检查已启动')
      await fetchData()
    } else {
      message.error('节点检查失败')
    }
  } catch (error) {
    console.error('节点检查失败:', error)
    message.error('节点检查失败')
  }
}

const handleCheckAllNodes = async () => {
  checkingAll.value = true
  try {
    const allNodeIds = nodes.value.map(node => node.id);
    const response = await fetch('/api/node-health-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeIds: allNodeIds })
    })
    
    if (response.ok) {
      message.success('所有节点检查已启动')
      await fetchData()
    } else {
      message.error('批量检查失败')
    }
  } catch (error) {
    console.error('批量检查失败:', error)
    message.error('批量检查失败')
  } finally {
    checkingAll.value = false
  }
}

const showImportModal = () => {
  nodeImportModalRef.value?.open()
}

const handleBatchImport = async (nodes: Node[]) => {
  if (nodes.length === 0) {
    message.warning('没有有效的节点可以导入')
    return
  }
  
  importing.value = true
  
  // 显示进度提示
  const progressKey = 'batch-import-progress'
  message.loading({
    content: `正在导入节点... (0/${nodes.length})`,
    key: progressKey,
    duration: 0
  })
  
  try {
    console.log('开始批量导入，节点数量:', nodes.length)
    console.log('节点数据示例:', nodes[0])
    
    // 准备所有节点的数据
    const nodeDataList = nodes.map(node => ({
      name: node.name,
      server: node.server,
      port: node.port,
      type: node.type,
      password: node.password || '',
      params: node.params || {}
    }))
    
    console.log('准备发送的数据:', nodeDataList.length, '个节点')
    
    // 使用新的批量导入API
    const response = await fetch('/api/nodes/batch-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes: nodeDataList })
    })
    
    console.log('API响应状态:', response.status, response.statusText)
    
    if (response.ok) {
      const result = await response.json()
      console.log('API响应数据:', result)
      
      // 关闭进度提示
      message.destroy(progressKey)
      
      // 显示结果
      if (result.successCount > 0 && result.errorCount === 0) {
        message.success(`批量导入完成！成功导入 ${result.successCount} 个节点`)
      } else if (result.successCount > 0 && result.errorCount > 0) {
        message.warning(`批量导入完成！成功 ${result.successCount} 个，失败 ${result.errorCount} 个`)
      } else if (result.successCount === 0) {
        message.error('批量导入失败！请检查节点格式')
      }
      
      // 立即刷新数据
      await fetchData()
      
      // 清空选择
      selectedRowKeys.value = []
      
    } else {
      message.destroy(progressKey)
      const errorData = await response.json()
      console.error('API错误响应:', errorData)
      message.error(errorData.message || '批量导入失败')
    }
    
  } catch (error) {
    message.destroy(progressKey)
    console.error('批量导入失败:', error)
    message.error(`批量导入失败: ${error instanceof Error ? error.message : '未知错误'}`)
  } finally {
    importing.value = false
  }
}

const handleDelete = async (id: string) => {
  try {
    const response = await fetch(`/api/nodes/${id}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      message.success('节点删除成功')
      await fetchData()
    } else {
      message.error('节点删除失败')
    }
  } catch (error) {
    console.error('删除节点失败:', error)
    message.error('节点删除失败')
  }
}

const exportNodes = () => {
  const exportData = nodes.value.map(node => ({
    name: node.name,
    server: node.server,
    port: node.port,
    type: node.type,
    password: node.password || ''
  }))
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `nodes-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  message.success('节点数据导出成功')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.nodes-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stats-section {
  background: var(--surface-color);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.dark .stat-card {
  background: #1c1c1e;
  border-color: var(--border-color);
}

.stat-card :deep(.ant-card-body) {
  background: var(--surface-color);
  color: var(--text-primary);
}

.dark .stat-card :deep(.ant-card-body) {
  background: #1c1c1e;
  color: var(--text-primary);
}

.stat-card :deep(.ant-statistic-title) {
  color: var(--text-primary);
}

.dark .stat-card :deep(.ant-statistic-title) {
  color: var(--text-primary);
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.filter-section {
  background: var(--surface-color);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 20px;
  margin-bottom: 24px;
}

.dark .filter-section {
  background: #1c1c1e;
  border-color: var(--border-color);
}

.filter-section :deep(.ant-input) {
  background: var(--surface-color);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.filter-section :deep(.ant-input-search) {
  background: var(--surface-color);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.filter-section :deep(.ant-select) {
  background: var(--surface-color);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.filter-section :deep(.ant-select-selector) {
  background: var(--surface-color) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

.filter-section :deep(.ant-btn) {
  background: var(--surface-color);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.filter-section :deep(.ant-btn:hover) {
  background: var(--primary-50);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.filter-section :deep(.ant-btn-primary) {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.filter-section :deep(.ant-btn-primary:hover) {
  background: var(--primary-dark);
  border-color: var(--primary-dark);
  color: white;
}

.dark .filter-section :deep(.ant-input) {
  background: #2c2c2e;
  border-color: var(--border-color);
  color: var(--text-primary);
}

.dark .filter-section :deep(.ant-input-search) {
  background: #2c2c2e;
  border-color: var(--border-color);
  color: var(--text-primary);
}

.dark .filter-section :deep(.ant-select) {
  background: #2c2c2e;
  border-color: var(--border-color);
  color: var(--text-primary);
}

.dark .filter-section :deep(.ant-select-selector) {
  background: #2c2c2e !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

.dark .filter-section :deep(.ant-btn) {
  background: #2c2c2e;
  border-color: var(--border-color);
  color: var(--text-primary);
}

.dark .filter-section :deep(.ant-btn:hover) {
  background: rgba(10, 132, 255, 0.1);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.dark .filter-section :deep(.ant-btn-primary) {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.dark .filter-section :deep(.ant-btn-primary:hover) {
  background: var(--primary-dark);
  border-color: var(--primary-dark);
  color: white;
}

.filter-section :deep(.ant-input::placeholder) {
  color: var(--text-tertiary);
}

.dark .filter-section :deep(.ant-input::placeholder) {
  color: var(--text-tertiary);
}

.filter-section :deep(.ant-select-selection-placeholder) {
  color: var(--text-tertiary);
}

.dark .filter-section :deep(.ant-select-selection-placeholder) {
  color: var(--text-tertiary);
}

.filter-section :deep(.ant-input-search .ant-input-search-icon) {
  color: var(--text-tertiary);
}

.dark .filter-section :deep(.ant-input-search .ant-input-search-icon) {
  color: var(--text-tertiary);
}

.filter-section :deep(.ant-input-clear-icon) {
  color: var(--text-tertiary);
}

.dark .filter-section :deep(.ant-input-clear-icon) {
  color: var(--text-tertiary);
}

.filter-section :deep(.ant-input-clear-icon:hover) {
  color: var(--text-primary);
}

.dark .filter-section :deep(.ant-input-clear-icon:hover) {
  color: var(--text-primary);
}

.nodes-content {
  background: var(--surface-color);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.nodes-table {
  border-radius: 12px;
}

.nodes-table :deep(.ant-table-thead > tr > th) {
  background: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  color: var(--text-primary);
}

.nodes-table :deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid var(--border-light);
  background: var(--surface-color);
  color: var(--text-primary);
}

.nodes-table :deep(.ant-table-tbody > tr:hover > td) {
  background: var(--primary-50);
}

.nodes-table :deep(.ant-table-row-selected > td) {
  background: var(--primary-50);
}

.nodes-table :deep(.ant-table) {
  background: var(--surface-color);
  color: var(--text-primary);
}

.nodes-table :deep(.ant-table-container) {
  background: var(--surface-color);
}

.nodes-table :deep(.ant-table-content) {
  background: var(--surface-color);
}

.nodes-table :deep(.ant-table-body) {
  background: var(--surface-color);
}

.dark .nodes-table :deep(.ant-table-thead > tr > th) {
  background: #2c2c2e;
  border-bottom-color: var(--border-color);
  color: var(--text-primary);
}

.dark .nodes-table :deep(.ant-table-tbody > tr > td) {
  border-bottom-color: var(--border-light);
  background: #1c1c1e;
  color: var(--text-primary);
}

.dark .nodes-table :deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(10, 132, 255, 0.1);
}

.dark .nodes-table :deep(.ant-table-row-selected > td) {
  background: rgba(10, 132, 255, 0.1);
}

.dark .nodes-table :deep(.ant-table) {
  background: #1c1c1e;
  color: var(--text-primary);
}

.dark .nodes-table :deep(.ant-table-container) {
  background: #1c1c1e;
}

.dark .nodes-table :deep(.ant-table-content) {
  background: #1c1c1e;
}

.dark .nodes-table :deep(.ant-table-body) {
  background: #1c1c1e;
}

.nodes-table :deep(.ant-pagination) {
  background: var(--surface-color);
  color: var(--text-primary);
}

.nodes-table :deep(.ant-pagination-item) {
  background: var(--surface-color);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.nodes-table :deep(.ant-pagination-item:hover) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.nodes-table :deep(.ant-pagination-item-active) {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.nodes-table :deep(.ant-pagination-prev),
.nodes-table :deep(.ant-pagination-next) {
  background: var(--surface-color);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.nodes-table :deep(.ant-pagination-prev:hover),
.nodes-table :deep(.ant-pagination-next:hover) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.nodes-table :deep(.ant-pagination-options) {
  color: var(--text-primary);
}

.nodes-table :deep(.ant-select) {
  background: var(--surface-color);
  color: var(--text-primary);
}

.nodes-table :deep(.ant-select-selector) {
  background: var(--surface-color) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

.dark .nodes-table :deep(.ant-pagination) {
  background: #1c1c1e;
  color: var(--text-primary);
}

.dark .nodes-table :deep(.ant-pagination-item) {
  background: #2c2c2e;
  border-color: var(--border-color);
  color: var(--text-primary);
}

.dark .nodes-table :deep(.ant-pagination-item:hover) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.dark .nodes-table :deep(.ant-pagination-item-active) {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.dark .nodes-table :deep(.ant-pagination-prev),
.dark .nodes-table :deep(.ant-pagination-next) {
  background: #2c2c2e;
  border-color: var(--border-color);
  color: var(--text-primary);
}

.dark .nodes-table :deep(.ant-pagination-prev:hover),
.dark .nodes-table :deep(.ant-pagination-next:hover) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.dark .nodes-table :deep(.ant-select) {
  background: #2c2c2e;
  color: var(--text-primary);
}

.dark .nodes-table :deep(.ant-select-selector) {
  background: #2c2c2e !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .stats-section .ant-row {
    margin: 0 -8px;
  }
  
  .stats-section .ant-col {
    padding: 0 8px;
    margin-bottom: 16px;
  }
  
  .filter-section .ant-row {
    margin: 0 -8px;
  }
  
  .filter-section .ant-col {
    padding: 0 8px;
    margin-bottom: 16px;
  }
}


/* 操作按钮样式 */
.action-button {
  border-radius: 6px;
  font-size: 12px;
  height: 28px;
  padding: 0 8px;
  color: var(--text-primary); /* Ensure text color is visible in light mode */
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.dark .action-button {
  color: var(--text-primary); /* Ensure text color is visible in dark mode */
}

/* 加载状态样式 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 12px;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-state-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state-text {
  font-size: 16px;
  margin-bottom: 8px;
}

.empty-state-description {
  font-size: 14px;
  opacity: 0.7;
}
</style>