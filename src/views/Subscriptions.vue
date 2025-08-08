<template>
  <div class="subscriptions-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">订阅管理</h1>
        <p class="page-subtitle">管理您的代理订阅源</p>
      </div>
      <div class="header-actions">
        <a-button type="default" @click="handleUpdateAll" :loading="updatingAll">
          <template #icon><SyncOutlined /></template>
          全部更新
        </a-button>
        <a-button type="default" @click="showImportModal">
          <template #icon><ImportOutlined /></template>
          批量导入
        </a-button>
        <a-button type="primary" @click="showCreateModal">
          <template #icon><PlusOutlined /></template>
          添加订阅
        </a-button>
      </div>
    </div>

    <!-- 订阅列表 -->
    <div class="subscriptions-content">
      <a-table
        :columns="columns"
        :data-source="subscriptions"
        :loading="loading"
        :pagination="false"
        row-key="id"
        class="subscriptions-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.id)">
              {{ getStatusText(record.id) }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button type="text" size="small" @click="handlePreview(record)">
                <template #icon><EyeOutlined /></template>
                预览
              </a-button>
              <a-button type="text" size="small" @click="handleUpdate(record.id)" :loading="isUpdating(record.id)">
                <template #icon><SyncOutlined /></template>
                更新
              </a-button>
              <a-button type="text" size="small" @click="handleEdit(record)">
                <template #icon><EditOutlined /></template>
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除这个订阅吗？"
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

    <!-- 创建/编辑订阅模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :confirm-loading="submitting"
      ok-text="确定"
      cancel-text="取消"
    >
      <a-form :model="formData" :rules="formRules" layout="vertical" ref="formRef">
        <a-form-item label="订阅名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入订阅名称" />
        </a-form-item>
        
        <a-form-item label="订阅链接" name="url">
          <a-input v-model:value="formData.url" placeholder="请输入订阅链接" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 批量导入模态框 -->
    <a-modal
      v-model:open="importModalVisible"
      title="批量导入订阅"
      @ok="handleImport"
      @cancel="handleCancel"
      :confirm-loading="importing"
      ok-text="确定"
      cancel-text="取消"
    >
      <a-form layout="vertical">
        <a-form-item label="订阅链接">
          <a-textarea
            v-model:value="importUrls"
            placeholder="请输入订阅链接，每行一个"
            :rows="6"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 预览模态框 -->
    <a-modal
      v-model:open="previewModalVisible"
      :title="`预览订阅: ${previewSubName}`"
      width="80%"
      :footer="null"
    >
      <a-spin :spinning="previewLoading">
        <a-table
          :columns="previewColumns"
          :data-source="previewNodes"
          :pagination="{ pageSize: 10 }"
          size="small"
        />
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  SyncOutlined,
  ImportOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons-vue'
import type { Subscription, SubscriptionStatus } from '@shared/types'

// 响应式数据
const loading = ref(false)
const updatingAll = ref(false)
const importing = ref(false)
const submitting = ref(false)
const previewLoading = ref(false)

const subscriptions = ref<Subscription[]>([])
const statuses = ref<Record<string, SubscriptionStatus>>({})

// 模态框状态
const modalVisible = ref(false)
const importModalVisible = ref(false)
const previewModalVisible = ref(false)
const isEdit = ref(false)
const currentId = ref('')

// 表单数据
const formData = ref({
  name: '',
  url: ''
})

const importUrls = ref('')
const previewNodes = ref([])
const previewSubName = ref('')

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入订阅名称' }],
  url: [{ required: true, message: '请输入订阅链接' }]
}

// 计算属性
const modalTitle = computed(() => isEdit.value ? '编辑订阅' : '添加订阅')

// 表格列定义
const columns = [
  {
    title: '订阅名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '节点数量',
    dataIndex: 'nodeCount',
    key: 'nodeCount',
    customRender: ({ record }: { record: Subscription }) => {
      const status = statuses.value[record.id]
      return status?.nodeCount || 0
    }
  },
  {
    title: '最后更新',
    key: 'lastUpdated',
    customRender: ({ record }: { record: Subscription }) => {
      const status = statuses.value[record.id]
      if (status?.lastUpdated) {
        return new Date(status.lastUpdated).toLocaleString()
      }
      return '未更新'
    }
  },
  {
    title: '状态',
    key: 'status'
  },
  {
    title: '操作',
    key: 'actions',
    width: 300
  }
]

const previewColumns = [
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '服务器', dataIndex: 'server', key: 'server' },
  { title: '端口', dataIndex: 'port', key: 'port' }
]

// 方法
const fetchData = async () => {
  loading.value = true
  try {
    const [subsRes, statusesRes] = await Promise.all([
      fetch('/api/subscriptions'),
      fetch('/api/subscription-statuses')
    ])
    
    if (subsRes.ok) {
      subscriptions.value = await subsRes.json()
    }
    
    if (statusesRes.ok) {
      const statusesArray = await statusesRes.json()
      statuses.value = statusesArray.reduce((acc: Record<string, SubscriptionStatus>, status: SubscriptionStatus) => {
        acc[status.id] = status
        return acc
      }, {})
    }
  } catch (error) {
    console.error('获取订阅数据失败:', error)
    message.error('获取订阅数据失败')
  } finally {
    loading.value = false
  }
}

const getStatusColor = (id: string) => {
  const status = statuses.value[id]
  if (!status) return 'default'
  if (status.status === 'error') return 'error'
  if (status.status === 'updating') return 'processing'
  return 'success'
}

const getStatusText = (id: string) => {
  const status = statuses.value[id]
  if (!status) return '未知'
  if (status.status === 'error') return '更新失败'
  if (status.status === 'updating') return '更新中'
  return '正常'
}

const isUpdating = (id: string) => {
  return statuses.value[id]?.status === 'updating'
}

const showCreateModal = () => {
  isEdit.value = false
  formData.value = { name: '', url: '' }
  modalVisible.value = true
}

const handleEdit = (record: Subscription) => {
  isEdit.value = true
  currentId.value = record.id
  formData.value = { name: record.name, url: record.url }
  modalVisible.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const url = isEdit.value ? `/api/subscriptions/${currentId.value}` : '/api/subscriptions'
    const method = isEdit.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    })
    
    if (response.ok) {
      message.success(isEdit.value ? '订阅更新成功' : '订阅创建成功')
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
    const response = await fetch(`/api/subscriptions/${id}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      message.success('订阅删除成功')
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

const handleUpdate = async (id: string) => {
  try {
    const response = await fetch(`/api/subscriptions/${id}/update`, {
      method: 'POST'
    })
    
    if (response.ok) {
      message.success('订阅更新成功')
      await fetchData()
    } else {
      const error = await response.json()
      message.error(error.message || '更新失败')
    }
  } catch (error) {
    console.error('更新失败:', error)
    message.error('更新失败')
  }
}

const handleUpdateAll = async () => {
  updatingAll.value = true
  try {
    await Promise.all(
      subscriptions.value.map(sub => handleUpdate(sub.id))
    )
    message.success('全部订阅更新完成')
  } catch (error) {
    console.error('批量更新失败:', error)
    message.error('批量更新失败')
  } finally {
    updatingAll.value = false
  }
}

const showImportModal = () => {
  importUrls.value = ''
  importModalVisible.value = true
}

const handleImport = async () => {
  if (!importUrls.value.trim()) {
    message.warning('请输入订阅链接')
    return
  }
  
  importing.value = true
  try {
    const urls = importUrls.value.split('\n').filter(url => url.trim())
    
    // Prepare subscriptions array for batch import
    const subscriptionsToImport = urls.map((url, index) => ({
      id: crypto.randomUUID(), // Generate a unique ID for each subscription
      name: `导入订阅 ${index + 1}`, // Generate a default name, can be improved later
      url: url.trim()
    }));

    const response = await fetch('/api/subscriptions/batch-import', { // <-- New API endpoint
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptions: subscriptionsToImport }) // <-- New request body structure
    })

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        let messageText = `批量导入完成！成功导入 ${result.created} 个订阅`;
        if (result.failed > 0) {
          messageText += `，失败 ${result.failed} 个。`;
          // Optionally, display detailed errors
          result.errors.forEach((err: any) => {
            console.error(`导入失败: ${err.subscription} - ${err.error}`);
          });
        }
        message.success(messageText);
      } else {
        message.error(result.message || '批量导入失败');
      }
      importModalVisible.value = false
      await fetchData()
    } else {
      const errorData = await response.json()
      message.error(errorData.message || '批量导入失败')
    }
  } catch (error) {
    console.error('批量导入失败:', error)
    message.error('批量导入失败')
  } finally {
    importing.value = false
  }
}

const handlePreview = async (record: Subscription) => {
  previewModalVisible.value = true
  previewSubName.value = record.name
  previewLoading.value = true
  
  try {
    const response = await fetch(`/api/subscriptions/preview/${record.id}`)
    if (response.ok) {
      const data = await response.json()
      previewNodes.value = data.nodes
    } else {
      const error = await response.json()
      message.error(error.message || '获取预览失败')
    }
  } catch (error) {
    console.error('预览失败:', error)
    message.error('预览失败')
  } finally {
    previewLoading.value = false
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
.subscriptions-page {
  padding: 24px;
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

.subscriptions-content {
  background: var(--surface-color);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.dark .subscriptions-content {
  background: #1c1c1e;
  border-color: var(--border-color);
}

.subscriptions-table {
  border-radius: 12px;
}

.subscriptions-content :deep(.ant-input) {
  background: var(--surface-color);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.subscriptions-content :deep(.ant-select) {
  background: var(--surface-color);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.subscriptions-content :deep(.ant-select-selector) {
  background: var(--surface-color) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

.subscriptions-content :deep(.ant-btn) {
  background: var(--surface-color);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.subscriptions-content :deep(.ant-btn:hover) {
  background: var(--primary-50);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.subscriptions-content :deep(.ant-btn-primary) {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.subscriptions-content :deep(.ant-btn-primary:hover) {
  background: var(--primary-dark);
  border-color: var(--primary-dark);
  color: white;
}

.subscriptions-content :deep(.ant-btn-danger) {
  background: var(--error-color);
  border-color: var(--error-color);
  color: white;
}

.subscriptions-content :deep(.ant-btn-danger:hover) {
  background: #ff7875;
  border-color: #ff7875;
  color: white;
}

.dark .subscriptions-content :deep(.ant-input) {
  background: #2c2c2e;
  border-color: var(--border-color);
  color: var(--text-primary);
}

.dark .subscriptions-content :deep(.ant-select) {
  background: #2c2c2e;
  border-color: var(--border-color);
  color: var(--text-primary);
}

.dark .subscriptions-content :deep(.ant-select-selector) {
  background: #2c2c2e !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

.dark .subscriptions-content :deep(.ant-btn) {
  background: #2c2c2e;
  border-color: var(--border-color);
  color: var(--text-primary);
}

.dark .subscriptions-content :deep(.ant-btn:hover) {
  background: rgba(10, 132, 255, 0.1);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.dark .subscriptions-content :deep(.ant-btn-primary) {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.dark .subscriptions-content :deep(.ant-btn-primary:hover) {
  background: var(--primary-dark);
  border-color: var(--primary-dark);
  color: white;
}

.dark .subscriptions-content :deep(.ant-btn-danger) {
  background: var(--error-color);
  border-color: var(--error-color);
  color: white;
}

.dark .subscriptions-content :deep(.ant-btn-danger:hover) {
  background: #ff7875;
  border-color: #ff7875;
  color: white;
}

.subscriptions-content :deep(.ant-input::placeholder) {
  color: var(--text-tertiary);
}

.dark .subscriptions-content :deep(.ant-input::placeholder) {
  color: var(--text-tertiary);
}

.subscriptions-content :deep(.ant-select-selection-placeholder) {
  color: var(--text-tertiary);
}

.dark .subscriptions-content :deep(.ant-select-selection-placeholder) {
  color: var(--text-tertiary);
}

.subscriptions-table :deep(.ant-table-thead > tr > th) {
  background: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  color: var(--text-primary);
}

.subscriptions-table :deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid var(--border-light);
  background: var(--surface-color);
  color: var(--text-primary);
}

.subscriptions-table :deep(.ant-table-tbody > tr:hover > td) {
  background: var(--primary-50);
}

.subscriptions-table :deep(.ant-table) {
  background: var(--surface-color);
  color: var(--text-primary);
}

.subscriptions-table :deep(.ant-table-container) {
  background: var(--surface-color);
}

.subscriptions-table :deep(.ant-table-content) {
  background: var(--surface-color);
}

.subscriptions-table :deep(.ant-table-body) {
  background: var(--surface-color);
}

.dark .subscriptions-table :deep(.ant-table-thead > tr > th) {
  background: #2c2c2e;
  border-bottom-color: var(--border-color);
  color: var(--text-primary);
}

.dark .subscriptions-table :deep(.ant-table-tbody > tr > td) {
  border-bottom-color: var(--border-light);
  background: #1c1c1e;
  color: var(--text-primary);
}

.dark .subscriptions-table :deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(10, 132, 255, 0.1);
}

.dark .subscriptions-table :deep(.ant-table) {
  background: #1c1c1e;
  color: var(--text-primary);
}

.dark .subscriptions-table :deep(.ant-table-container) {
  background: #1c1c1e;
}

.dark .subscriptions-table :deep(.ant-table-content) {
  background: #1c1c1e;
}

.dark .subscriptions-table :deep(.ant-table-body) {
  background: #1c1c1e;
}

@media (max-width: 768px) {
  .subscriptions-page {
    padding: 16px;
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