<template>
  <div class="profiles-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">配置文件管理</h1>
        <p class="page-subtitle">管理您的代理配置文件</p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="showCreateModal">
          <template #icon><PlusOutlined /></template>
          添加配置文件
        </a-button>
      </div>
    </div>

    <!-- 配置文件列表 -->
    <div class="profiles-content">
      <a-table
        :columns="columns"
        :data-source="profiles"
        :loading="loading"
        :pagination="false"
        row-key="id"
        class="profiles-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'nodes'">
            <a-space align="center">
              <ClusterOutlined />
              <span>{{ record.nodeIds?.length || 0 }}</span>
            </a-space>
          </template>
          
          <template v-if="column.key === 'subscriptions'">
            <a-space align="center">
              <WifiOutlined />
              <span>{{ record.subscriptionIds?.length || 0 }}</span>
            </a-space>
          </template>

          <template v-if="column.key === 'subscribe_url'">
            <a-space>
              <a-button type="text" size="small" @click="handleCopy(getSubscriptionUrl(record))">
                <template #icon><CopyOutlined /></template>
                复制链接
              </a-button>
              <a-button type="text" size="small" @click="showQrCode(getSubscriptionUrl(record))">
                <template #icon><QrcodeOutlined /></template>
                二维码
              </a-button>
            </a-space>
          </template>
          
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button type="text" size="small" @click="handleEdit(record)">
                <template #icon><EditOutlined /></template>
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除这个配置文件吗？"
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

    <!-- 创建/编辑配置文件模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :confirm-loading="submitting"
      width="800px"
    >
      <a-form :model="formData" :rules="formRules" layout="vertical" ref="formRef">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="配置文件名称" name="name">
              <a-input v-model:value="formData.name" placeholder="请输入配置文件名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="别名" name="alias">
              <a-tooltip title="可选，用于自定义订阅链接，如果留空则使用配置文件ID">
                <a-input v-model:value="formData.alias" placeholder="可选，用于自定义订阅链接" />
              </a-tooltip>
            </a-form-item>
          </a-col>
        </a-row>

        <a-tabs type="card" class="node-sub-tabs">
          <a-tab-pane key="nodes" tab="选择节点">
            <a-transfer
              v-model:target-keys="selectedNodeIds"
              :data-source="availableNodes"
              :titles="['可用节点', '已选节点']"
              :render="item => item.title"
              :show-search="true"
              :filter-option="filterOption"
              @change="handleNodeChange"
              class="full-width-transfer"
            />
          </a-tab-pane>
          <a-tab-pane key="subscriptions" tab="选择订阅">
            <a-transfer
              v-model:target-keys="selectedSubscriptionIds"
              :data-source="availableSubscriptions"
              :titles="['可用订阅', '已选订阅']"
              :render="item => item.title"
              :show-search="true"
              :filter-option="filterOption"
              @change="handleSubscriptionChange"
              class="full-width-transfer"
            />
          </a-tab-pane>
        </a-tabs>
      </a-form>
      <template #footer>
        <a-button key="back" @click="handleCancel">取消</a-button>
        <a-button key="template" type="default" @click="showTemplateSelectModal">配置模板</a-button>
        <a-button key="submit" type="primary" :loading="submitting" @click="handleSubmit">确定</a-button>
      </template>
    </a-modal>

    <!-- 配置模板选择模态框 -->
    <a-modal
      v-model:open="templateSelectModalVisible"
      title="配置模板"
      width="600px"
      @ok="handleTemplateSelectConfirm"
      @cancel="templateSelectModalVisible = false"
    >
      <a-tabs v-model:activeKey="formData.clientType" type="card">
        <a-tab-pane key="clash" tab="Clash" />
        <a-tab-pane key="surge" tab="Surge" />
        <a-tab-pane key="quantumult-x" tab="Quantumult X" />
        <a-tab-pane key="loon" tab="Loon" />
        <a-tab-pane key="sing-box" tab="Sing-Box" />
      </a-tabs>
    </a-modal>

    <!-- 二维码模态框 -->
    <a-modal
      v-model:open="qrModalVisible"
      title="订阅链接二维码"
      :footer="null"
      width="400px"
    >
      <div class="qr-content">
        <qrcode-vue :value="qrCodeUrl" :size="200" level="M" />
        <p class="qr-url">{{ qrCodeUrl }}</p>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  ClusterOutlined,
  WifiOutlined,
  CopyOutlined,
  QrcodeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import QrcodeVue from 'qrcode.vue'
import type { Profile, Node, Subscription } from '@shared/types'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)

const profiles = ref<Profile[]>([])
const nodes = ref<Node[]>([])
const subscriptions = ref<Subscription[]>([])

// 模态框状态
const modalVisible = ref(false)
const qrModalVisible = ref(false)
const templateSelectModalVisible = ref(false)
const isEdit = ref(false)
const currentId = ref('')

// 表单数据
const formData = ref({
  name: '',
  alias: '',
  clientType: 'clash' // Default to Clash
})

const selectedNodeIds = ref<string[]>([])
const selectedSubscriptionIds = ref<string[]>([])

// 二维码数据
const qrCodeUrl = ref('')

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入配置文件名称' }],
  clientType: [{ required: true, message: '请选择客户端类型' }]
}

// 计算属性
const modalTitle = computed(() => isEdit.value ? '编辑配置文件' : '添加配置文件')

const availableNodes = computed(() => {
  return nodes.value.map(node => ({
    key: node.id,
    title: `${node.name} (${node.server}:${node.port})`,
    ...node
  }))
})

const availableSubscriptions = computed(() => {
  return subscriptions.value.map(sub => ({
    key: sub.id,
    title: sub.name,
    ...sub
  }))
})

// 表格列定义
const columns = [
  {
    title: '配置文件名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '节点数量',
    key: 'nodes'
  },
  {
    title: '订阅数量',
    key: 'subscriptions'
  },
  {
    title: '订阅链接',
    key: 'subscribe_url'
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
    const [profilesRes, nodesRes, subscriptionsRes] = await Promise.all([
      fetch('/api/profiles'),
      fetch('/api/nodes'),
      fetch('/api/subscriptions')
    ])
    
    if (profilesRes.ok) {
      profiles.value = await profilesRes.json()
    }
    
    if (nodesRes.ok) {
      nodes.value = await nodesRes.json()
    }
    
    if (subscriptionsRes.ok) {
      subscriptions.value = await subscriptionsRes.json()
    }
  } catch (error) {
    console.error('获取配置文件数据失败:', error)
    message.error('获取配置文件数据失败')
  } finally {
    loading.value = false
  }
}

const showCreateModal = () => {
  isEdit.value = false
  formData.value = { name: '', alias: '', clientType: 'clash' }
  selectedNodeIds.value = []
  selectedSubscriptionIds.value = []
  modalVisible.value = true
}

const handleEdit = (record: Profile) => {
  isEdit.value = true
  currentId.value = record.id
  formData.value = {
    name: record.name,
    alias: record.alias || '',
    clientType: record.clientType || 'clash' // Default to Clash if not set
  }
  selectedNodeIds.value = record.nodeIds || []
  selectedSubscriptionIds.value = record.subscriptionIds || []
  modalVisible.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const url = isEdit.value ? `/api/profiles/${currentId.value}` : '/api/profiles'
    const method = isEdit.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData.value,
        nodeIds: selectedNodeIds.value,
        subscriptionIds: selectedSubscriptionIds.value
      })
    })
    
    if (response.ok) {
      message.success(isEdit.value ? '配置文件更新成功' : '配置文件创建成功')
      modalVisible.value = false
      await fetchData()
    } else {
      const error = await response.json()
      console.error('后端操作失败响应:', error) // Added console.error
      message.error(error.message || '操作失败')
    }
  } catch (error) {
    console.error('操作失败:', error)
    message.error('操作失败')
  } finally {
    submitting.value = false // Ensure submitting is always reset
  }
}

const handleDelete = async (id: string) => {
  try {
    const response = await fetch(`/api/profiles/${id}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      message.success('配置文件删除成功')
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

const showTemplateSelectModal = () => {
  templateSelectModalVisible.value = true;
}

const handleTemplateSelectConfirm = () => {
  templateSelectModalVisible.value = false;
}

const handleNodeChange = (targetKeys: string[]) => {
  selectedNodeIds.value = targetKeys
}

const handleSubscriptionChange = (targetKeys: string[]) => {
  selectedSubscriptionIds.value = targetKeys
}

const filterOption = (inputValue: string, item: any) => {
  return item.title.indexOf(inputValue) !== -1
}

const getSubscriptionUrl = (profile: Profile) => {
  const baseUrl = window.location.origin
  if (profile.alias) {
    return `${baseUrl}/sub/${profile.alias}`
  }
  return `${baseUrl}/api/subscribe/${profile.id}`
}

const handleCopy = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    message.success('链接已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    message.error('复制失败')
  }
}

const showQrCode = (url: string) => {
  qrCodeUrl.value = url
  qrModalVisible.value = true
}

const handleCancel = () => {
  modalVisible.value = false
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.profiles-page {
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

.profiles-content {
  background: var(--surface-color);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.profiles-table {
  border-radius: 12px;
}

.qr-content {
  text-align: center;
}

.qr-url {
  margin-top: 16px;
  word-break: break-all;
  color: var(--text-secondary);
  font-size: 12px;
}

.full-width-transfer .ant-transfer-list {
  width: 100%;
  height: 300px; /* Adjust height as needed */
}

@media (max-width: 768px) {
  .profiles-page {
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