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
        <a-button type="default" @click="showImportModal">
          <template #icon><ImportOutlined /></template>
          导入节点
        </a-button>
        <a-button type="primary" @click="showCreateModal">
          <template #icon><PlusOutlined /></template>
          添加节点
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
            <a-tag :color="getStatusColor(record.id)" class="status-tag">
              {{ getStatusText(record.id) }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.type)" class="type-tag">
              {{ getTypeText(record.type) }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button type="text" size="small" @click="handleCheck(record)" :loading="isChecking(record.id)" class="action-button">
                <template #icon><ReloadOutlined /></template>
                检查
              </a-button>
              <a-button type="text" size="small" @click="handleEdit(record)" class="action-button">
                <template #icon><EditOutlined /></template>
                编辑
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

    <!-- 创建/编辑节点模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :confirm-loading="submitting"
      width="600px"
    >
      <a-form :model="formData" :rules="formRules" layout="vertical" ref="formRef">
        <a-form-item label="节点名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入节点名称" />
        </a-form-item>
        
        <a-form-item label="服务器地址" name="server">
          <a-input v-model:value="formData.server" placeholder="请输入服务器地址" />
        </a-form-item>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="端口" name="port">
              <a-input-number v-model:value="formData.port" placeholder="端口" :min="1" :max="65535" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="类型" name="type">
              <a-select v-model:value="formData.type" placeholder="选择节点类型">
                <a-select-option value="vmess">VMess</a-select-option>
                <a-select-option value="vless">VLESS</a-select-option>
                <a-select-option value="trojan">Trojan</a-select-option>
                <a-select-option value="ss">Shadowsocks</a-select-option>
                <a-select-option value="ssr">ShadowsocksR</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="密码" name="password">
          <a-input-password v-model:value="formData.password" placeholder="请输入密码" />
        </a-form-item>

        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="formData.remark" placeholder="可选：添加节点备注信息" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 批量导入模态框 -->
    <NodeImportModal ref="nodeImportModalRef" @import="handleBatchImport" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  ReloadOutlined,
  ImportOutlined,
  PlusOutlined,
  EditOutlined,
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
const submitting = ref(false)

const nodes = ref<Node[]>([])
const nodeStatus = ref<Record<string, HealthStatus>>({})

// 模态框状态
const modalVisible = ref(false)
const importModalVisible = ref(false)
const isEdit = ref(false)
const currentId = ref('')

// 表单数据
const formData = ref({
  name: '',
  server: '',
  port: 443,
  type: 'vmess',
  password: '',
  remark: ''
})

const importLinks = ref('')
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

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入节点名称' }],
  server: [{ required: true, message: '请输入服务器地址' }],
  port: [{ required: true, message: '请输入端口' }],
  type: [{ required: true, message: '请选择节点类型' }]
}

// 计算属性
const modalTitle = computed(() => isEdit.value ? '编辑节点' : '添加节点')

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

// 表格行选择配置
const rowSelection = {
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys
  }
}

// 表格列定义
const columns = [
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
    key: 'status'
  },
  {
    title: '操作',
    key: 'actions',
    width: 200
  }
]

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
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedRowKeys.value })
    })

    if (response.ok) {
      message.success(`成功删除 ${selectedRowKeys.value.length} 个节点`)
      selectedRowKeys.value = []
      await fetchData()
    } else {
      message.error('批量删除失败')
    }
  } catch (error) {
    console.error('批量删除失败:', error)
    message.error('批量删除失败')
  }
}

const showCreateModal = () => {
  isEdit.value = false
  formData.value = {
    name: '',
    server: '',
    port: 443,
    type: 'vmess',
    password: '',
    remark: ''
  }
  modalVisible.value = true
}

const handleEdit = (record: Node) => {
  isEdit.value = true
  currentId.value = record.id
  formData.value = {
    name: record.name,
    server: record.server,
    port: record.port,
    type: record.type,
    password: record.password || '',
    remark: (record as any).remark || ''
  }
  modalVisible.value = true
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
    const response = await fetch('/api/node-health-check', {
      method: 'POST'
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
  try {
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []
    
    for (const node of nodes) {
      try {
        const response = await fetch('/api/nodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(node)
        })
        
        if (response.ok) {
          successCount++
        } else {
          errorCount++
          const errorData = await response.json()
          errors.push(`导入失败 ${node.name}: ${errorData.message || '未知错误'}`)
        }
      } catch (error) {
        errorCount++
        errors.push(`导入失败 ${node.name}: ${error}`)
        console.error('导入节点失败:', error)
      }
    }
    
    // 显示结果
    if (successCount > 0) {
      message.success(`成功导入 ${successCount} 个节点`)
    }
    
    if (errorCount > 0) {
      message.warning(`导入完成，但有 ${errorCount} 个节点导入失败`)
      console.error('导入错误详情:', errors)
    }
    
    await fetchData()
  } catch (error) {
    console.error('批量导入失败:', error)
    message.error('批量导入失败')
  } finally {
    importing.value = false
  }
}

const handleImport = async () => {
  if (!importLinks.value.trim()) {
    message.warning('请输入节点链接')
    return
  }
  
  importing.value = true
  try {
    const links = importLinks.value.split('\n').filter(link => link.trim())
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []
    
    for (const link of links) {
      try {
        // 使用节点解析器解析链接
        const parsedNode = parseNodeLink(link)
        
        if (!parsedNode) {
          errorCount++
          errors.push(`无法解析链接: ${link}`)
          continue
        }
        
        // 验证必要字段
        if (!parsedNode.server || !parsedNode.port) {
          errorCount++
          errors.push(`节点信息不完整: ${link}`)
          continue
        }
        
        // 创建完整的节点对象
        const nodeData = {
          name: parsedNode.name || `${parsedNode.server}:${parsedNode.port}`,
          server: parsedNode.server,
          port: parsedNode.port,
          type: parsedNode.type || 'vmess',
          password: parsedNode.password || '',
          params: parsedNode.params || {}
        }
        
        const response = await fetch('/api/nodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nodeData)
        })
        
        if (response.ok) {
          successCount++
        } else {
          errorCount++
          const errorData = await response.json()
          errors.push(`导入失败: ${errorData.message || '未知错误'}`)
        }
      } catch (error) {
        errorCount++
        errors.push(`解析失败: ${link}`)
        console.error('导入节点失败:', error)
      }
    }
    
    // 显示结果
    if (successCount > 0) {
      message.success(`成功导入 ${successCount} 个节点`)
    }
    
    if (errorCount > 0) {
      message.warning(`导入完成，但有 ${errorCount} 个节点导入失败`)
      console.error('导入错误详情:', errors)
    }
    
    importModalVisible.value = false
    importLinks.value = ''
    await fetchData()
  } catch (error) {
    console.error('批量导入失败:', error)
    message.error('批量导入失败')
  } finally {
    importing.value = false
  }
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const url = isEdit.value ? `/api/nodes/${currentId.value}` : '/api/nodes'
    const method = isEdit.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    })
    
    if (response.ok) {
      message.success(isEdit.value ? '节点更新成功' : '节点创建成功')
      modalVisible.value = false
      await fetchData()
    } else {
      const errorData = await response.json()
      message.error(errorData.message || '操作失败')
    }
  } catch (error) {
    console.error('提交节点数据失败:', error)
    message.error('操作失败')
  } finally {
    submitting.value = false
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

const handleCancel = () => {
  modalVisible.value = false
  importModalVisible.value = false
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
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
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
}

.nodes-table :deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid var(--border-light);
}

.nodes-table :deep(.ant-table-tbody > tr:hover > td) {
  background: var(--primary-50);
}

.nodes-table :deep(.ant-table-row-selected > td) {
  background: var(--primary-50);
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

/* 状态标签样式 */
.status-tag {
  border-radius: 6px;
  font-weight: 500;
  padding: 2px 8px;
}

.status-tag.online {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #52c41a;
}

.status-tag.offline {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
}

.status-tag.checking {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #1890ff;
}

.status-tag.unknown {
  background: #fafafa;
  border: 1px solid #d9d9d9;
  color: #8c8c8c;
}

/* 类型标签样式 */
.type-tag {
  border-radius: 6px;
  font-weight: 500;
  padding: 2px 8px;
}

.type-tag.vmess {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #1890ff;
}

.type-tag.vless {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #52c41a;
}

.type-tag.trojan {
  background: #f9f0ff;
  border: 1px solid #d3adf7;
  color: #722ed1;
}

.type-tag.ss {
  background: #fff7e6;
  border: 1px solid #ffd591;
  color: #fa8c16;
}

.type-tag.ssr {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
}

/* 操作按钮样式 */
.action-button {
  border-radius: 6px;
  font-size: 12px;
  height: 28px;
  padding: 0 8px;
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
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