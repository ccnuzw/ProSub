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

    <!-- 节点列表 -->
    <div class="nodes-content">
      <a-table
        :columns="columns"
        :data-source="nodes"
        :loading="loading"
        :pagination="false"
        row-key="id"
        class="nodes-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.id)">
              {{ getStatusText(record.id) }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button type="text" size="small" @click="handleCheck(record)" :loading="isChecking(record.id)">
                <template #icon><ReloadOutlined /></template>
                检查
              </a-button>
              <a-button type="text" size="small" @click="handleEdit(record)">
                <template #icon><EditOutlined /></template>
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除这个节点吗？"
                @confirm="handleDelete(record.id)"
                ok-text="确定"
                cancel-text="取消"
              >
                <a-button type="text" size="small" danger>
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
      </a-form>
    </a-modal>

    <!-- 批量导入模态框 -->
    <a-modal
      v-model:open="importModalVisible"
      title="批量导入节点"
      @ok="handleImport"
      @cancel="handleCancel"
      :confirm-loading="importing"
    >
      <a-form layout="vertical">
        <a-form-item label="节点链接">
          <a-textarea
            v-model:value="importLinks"
            placeholder="请输入节点链接，每行一个"
            :rows="6"
          />
        </a-form-item>
      </a-form>
    </a-modal>
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
  CloseCircleOutlined
} from '@ant-design/icons-vue'
import type { Node, HealthStatus } from '@shared/types'

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
  password: ''
})

const importLinks = ref('')

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入节点名称' }],
  server: [{ required: true, message: '请输入服务器地址' }],
  port: [{ required: true, message: '请输入端口' }],
  type: [{ required: true, message: '请选择节点类型' }]
}

// 计算属性
const modalTitle = computed(() => isEdit.value ? '编辑节点' : '添加节点')

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
    key: 'type',
    customRender: ({ text }: { text: string }) => {
      const typeMap: Record<string, string> = {
        vmess: 'VMess',
        vless: 'VLESS',
        trojan: 'Trojan',
        ss: 'Shadowsocks',
        ssr: 'ShadowsocksR'
      }
      return typeMap[text] || text
    }
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

const isChecking = (id: string) => {
  return nodeStatus.value[id]?.status === 'checking'
}

const showCreateModal = () => {
  isEdit.value = false
  formData.value = {
    name: '',
    server: '',
    port: 443,
    type: 'vmess',
    password: ''
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
    password: record.password || ''
  }
  modalVisible.value = true
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
      const error = await response.json()
      message.error(error.message || '操作失败')
    }
  } catch (error) {
    console.error('操作失败:', error)
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
      const error = await response.json()
      message.error(error.message || '删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败')
  }
}

const handleCheck = async (record: Node) => {
  try {
    const response = await fetch('/api/node-health-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        server: record.server,
        port: record.port,
        nodeId: record.id
      })
    })
    
    if (response.ok) {
      message.success('节点检查完成')
      await fetchData()
    } else {
      const error = await response.json()
      message.error(error.message || '检查失败')
    }
  } catch (error) {
    console.error('检查失败:', error)
    message.error('检查失败')
  }
}

const handleCheckAllNodes = async () => {
  checkingAll.value = true
  try {
    await Promise.all(nodes.value.map(node => handleCheck(node)))
    message.success('所有节点检查完成')
  } catch (error) {
    console.error('批量检查失败:', error)
    message.error('批量检查失败')
  } finally {
    checkingAll.value = false
  }
}

const showImportModal = () => {
  importLinks.value = ''
  importModalVisible.value = true
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
    
    for (const link of links) {
      try {
        // 这里应该解析节点链接并创建节点
        // 暂时使用模拟数据
        const response = await fetch('/api/nodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `导入节点 ${successCount + 1}`,
            server: 'example.com',
            port: 443,
            type: 'vmess',
            password: 'password'
          })
        })
        
        if (response.ok) {
          successCount++
        }
      } catch (error) {
        console.error('导入节点失败:', error)
      }
    }
    
    message.success(`成功导入 ${successCount} 个节点`)
    importModalVisible.value = false
    await fetchData()
  } catch (error) {
    console.error('批量导入失败:', error)
    message.error('批量导入失败')
  } finally {
    importing.value = false
  }
}

const handleCancel = () => {
  modalVisible.value = false
  importModalVisible.value = false
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

.nodes-content {
  background: var(--surface-color);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.nodes-table {
  border-radius: 12px;
}

@media (max-width: 768px) {
  .nodes-page {
    gap: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .header-actions .ant-btn {
    flex: 1;
  }
}
</style>