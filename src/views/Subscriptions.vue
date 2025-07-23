<template>
  <a-card>
    <div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <a-typography-title :level="3" class="mb-2 sm:mb-0">订阅管理</a-typography-title>
      <div class="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
        <div class="flex flex-col sm:flex-row gap-2">
          <a-button type="default" :icon="$slots.syncOutlined ? $slots.syncOutlined() : ''" @click="handleUpdateAll" :loading="updatingAll">全部更新</a-button>
          <a-button type="default" :icon="$slots.importOutlined ? $slots.importOutlined() : ''" @click="isImportModalVisible = true">导入订阅</a-button>
        </div>
        <router-link to="/subscriptions/new" class="w-full sm:w-auto">
          <a-button type="primary" :icon="$slots.plusOutlined ? $slots.plusOutlined() : ''" class="w-full sm:w-auto">添加订阅</a-button>
        </router-link>
      </div>
    </div>

    <!-- Desktop Table View -->
    <a-table
      v-if="!isMobile"
      :columns="columns"
      :data-source="subscriptions"
      row-key="id"
      :loading="loading"
      :scroll="{ x: 'max-content' }"
    >
      <template #emptyText>
        <a-empty
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="暂无订阅，快去添加一个吧！"
        >
          <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <router-link to="/subscriptions/new" class="w-full sm:w-auto">
              <a-button type="primary" :icon="$slots.plusOutlined ? $slots.plusOutlined() : ''" class="w-full sm:w-auto">手动添加</a-button>
            </router-link>
            <a-button :icon="$slots.importOutlined ? $slots.importOutlined() : ''" @click="isImportModalVisible = true" class="w-full sm:w-auto">从剪贴板导入</a-button>
          </div>
        </a-empty>
      </template>
    </a-table>

    <!-- Mobile Card View -->
    <div v-else class="grid grid-cols-1 gap-4">
      <a-card v-for="sub in subscriptions" :key="sub.id" :title="sub.name" size="small">
        <p><strong>节点数:</strong> {{ statuses[sub.id]?.nodeCount ?? 'N/A' }}</p>
        <p><strong>最后更新:</strong>
          <template v-if="statuses[sub.id]">
            <template v-if="statuses[sub.id].status === 'error'">
              <a-tooltip :title="statuses[sub.id].error">
                <a-tag :icon="h(CloseCircleOutlined)" color="error">更新失败</a-tag>
              </a-tooltip>
            </template>
            <template v-else>
              {{ formatTime(statuses[sub.id].lastUpdated) }}
            </template>
          </template>
          <template v-else>
            N/A
          </template>
        </p>
        <template #actions>
          <a-button type="text" :icon="h(EyeOutlined)" @click="handlePreview(sub)">预览</a-button>
          <a-button type="text" :icon="h(SyncOutlined)" @click="handleUpdate(sub.id)" :loading="statuses[sub.id]?.status === 'updating'">更新</a-button>
          <router-link :to="`/subscriptions/${sub.id}`">
            <a-button type="text" :icon="h(EditOutlined)">编辑</a-button>
          </router-link>
          <a-popconfirm title="确定要删除这个订阅吗？" @confirm="handleDelete(sub.id)" ok-text="确定" cancel-text="取消">
            <a-button type="text" danger :icon="h(DeleteOutlined)">删除</a-button>
          </a-popconfirm>
        </template>
      </a-card>
    </div>

    <a-modal :title="`预览订阅: ${previewSubName}`" v-model:open="isPreviewModalVisible" :footer="null" width="60%">
      <a-spin :spinning="previewLoading">
        <!-- Desktop Table View for Preview -->
        <a-table v-if="!isMobile" size="small" :columns="previewColumns" :data-source="previewNodes" :row-key="(record, index) => `${record.server}-${index}`" :pagination="{ pageSize: 10 }"/>

        <!-- Mobile Card View for Preview -->
        <div v-else class="grid grid-cols-1 gap-4">
          <a-card v-for="node in paginatedPreviewNodes" :key="`${node.server}-${node.port}`" size="small">
            <p><strong>名称:</strong> {{ node.name }}</p>
            <p><strong>类型:</strong> <a-tag :color="getNodeTypeColor(node.type)">{{ node.type }}</a-tag></p>
            <p><strong>服务器:</strong> {{ node.server }}</p>
            <p><strong>端口:</strong> {{ node.port }}</p>
          </a-card>
          <a-pagination
            v-if="previewNodes.length > previewPageSize"
            v-model:current="currentPreviewPage"
            :page-size="previewPageSize"
            :total="previewNodes.length"
            show-less-items
            class="mt-4 text-center"
          />
        </div>
      </a-spin>
    </a-modal>
    <a-modal title="从剪贴板导入订阅" v-model:open="isImportModalVisible" @ok="handleBatchImport" @cancel="isImportModalVisible = false" :confirm-loading="importing" ok-text="导入" cancel-text="取消">
      <p>请粘贴一个或多个订阅链接，每行一个。</p>
      <a-textarea :rows="10" v-model:value="importUrls" placeholder="https://example.com/sub1&#10;https://example.com/sub2"/>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, h, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import { message, Modal, Tag, Tooltip, Empty, Button, Space, Popconfirm, Card } from 'ant-design-vue'
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ImportOutlined,
} from '@ant-design/icons-vue'
import type { TableProps } from 'ant-design-vue'
import { Subscription, Node } from '@shared/types'
import { parseNodeLink } from '@shared/node-parser'

interface SubscriptionStatus {
  status: 'success' | 'error' | 'updating';
  nodeCount?: number;
  lastUpdated?: string;
  error?: string;
}

type ParsedNode = Partial<Node>;

const subscriptions = ref<Subscription>([])
const statuses = ref<Record<string, SubscriptionStatus>>({})
const loading = ref(true)
const updatingAll = ref(false)
const isPreviewModalVisible = ref(false)
const previewNodes = ref<ParsedNode>([])
const previewLoading = ref(false)
const previewSubName = ref('')
const isImportModalVisible = ref(false)
const importUrls = ref('')
const importing = ref(false)

const currentPreviewPage = ref(1)
const previewPageSize = ref(5) // Adjust as needed

const paginatedPreviewNodes = computed(() => {
  const start = (currentPreviewPage.value - 1) * previewPageSize.value
  const end = start + previewPageSize.value
  return previewNodes.value.slice(start, end)
})

const isMobile = ref(window.innerWidth < 640) // Tailwind's sm breakpoint is 640px

const handleResize = () => {
  isMobile.value = window.innerWidth < 640
}

const fetchData = async () => {
  loading.value = true
  try {
    const [subsRes, statusesRes] = await Promise.all([
      fetch('/api/subscriptions'),
      fetch('/api/subscription-statuses')
    ])
    const subsData = (await subsRes.json()) as Subscription[]
    const statusesData = (await statusesRes.json()) as Record<string, SubscriptionStatus>
    subscriptions.value = subsData
    statuses.value = statusesData
  } catch (error) {
    message.error('加载订阅列表或状态失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

const handleUpdate = async (id: string) => {
  statuses.value = { ...statuses.value, [id]: { status: 'updating' } }
  try {
    const res = await fetch(`/api/subscriptions/update/${id}`, { method: 'POST' })
    const updatedSub = (await res.json()) as Subscription;
    if (!res.ok) {
      const errorMessage = updatedSub.error || '更新失败';
      message.error(`订阅 "${subscriptions.value.find(s=>s.id===id)?.name}" 更新失败: ${errorMessage}`);
      throw new Error(errorMessage);
    }
    statuses.value = {
      ...statuses.value,
      [id]: {
        status: updatedSub.error ? 'error' : 'success',
        nodeCount: updatedSub.nodeCount,
        lastUpdated: updatedSub.lastUpdated,
        error: updatedSub.error,
      },
    };
    message.success(`订阅 "${subscriptions.value.find(s=>s.id===id)?.name}" 更新成功!`);
  } catch (error) {
    console.error('Error updating subscription:', error);
    if(error instanceof Error) {
      // message.error(error.message); // Already handled by the specific error message above
    } else {
      message.error('更新订阅时发生未知错误');
    }
    fetchData();
  }
}
const handleUpdateAll = async () => {
  updatingAll.value = true
  await Promise.allSettled(subscriptions.value.map(sub => handleUpdate(sub.id)))
  updatingAll.value = false
  message.success('所有订阅已更新完毕')
  fetchData()
}
const handleDelete = async (id: string) => {
  try {
    await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' })
    message.success('订阅删除成功')
    fetchData()
  } catch (error) {
    console.error('Failed to delete subscription:', error)
    message.error('删除订阅失败')
  }
}
const handlePreview = async (sub: Subscription) => {
  isPreviewModalVisible.value = true
  previewLoading.value = true
  previewSubName.value = sub.name
  currentPreviewPage.value = 1 // Reset page to 1 when new preview data loads
  try {
      const res = await fetch(`/api/subscriptions/preview/${sub.id}`)
      const data = (await res.json()) as { nodes?: Node[], error?: string }
      if(!res.ok) throw new Error(data.error || '预览失败')
      previewNodes.value = (data.nodes || []) as ParsedNode[]
  } catch (error) {
      if(error instanceof Error) message.error(error.message)
      previewNodes.value = []
  } finally {
      previewLoading.value = false
  }
}
const handleBatchImport = async () => {
  importing.value = true
  try {
    const res = await fetch('/api/subscriptions/batch-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: importUrls.value.split('\n').filter(url => url.trim() !== '') }),
    })
    const result = (await res.json()) as { message: string }
    if (!res.ok) {
      throw new Error(result.message || '导入失败')
    }
    message.success(result.message)
    isImportModalVisible.value = false
    importUrls.value = ''
    fetchData()
  } catch (error) {
    if (error instanceof Error) {
      message.error(error.message)
    } else {
      message.error('导入订阅失败')
    }
  } finally {
    importing.value = false
  }
}
const formatTime = (isoString?: string) => {
  if (!isoString) return '从未'
  try {
    return new Date(isoString).toLocaleString()
  } catch (e) {
    return '无效日期'
  }
}

const getNodeTypeColor = (type: string) => {
  switch (type) {
    case 'ss':
    case 'ssr':
      return 'blue';
    case 'vmess':
      return 'green';
    case 'vless':
    case 'vless-reality':
      return 'purple';
    case 'trojan':
      return 'red';
    case 'socks5':
      return 'orange';
    case 'anytls':
      return 'cyan';
    case 'tuic':
      return 'geekblue';
    case 'hysteria':
    case 'hysteria2':
      return 'volcano';
    default:
      return 'default';
  }
}

const previewColumns: TableProps<ParsedNode>['columns'] = [
  { title: '节点名称', dataIndex: 'name', key: 'name' },
  { title: '服务器', dataIndex: 'server', key: 'server' },
  { title: '端口', dataIndex: 'port', key: 'port' },
  { title: '类型', dataIndex: 'type', key: 'type', customRender: ({ text: type }) => h(Tag, { color: getNodeTypeColor(type) }, () => type) },
]

const columns: TableProps<Subscription>['columns'] = [
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '节点数', key: 'nodeCount', customRender: ({ record }) => statuses.value[record.id]?.nodeCount ?? 'N/A' },
  { title: '最后更新', key: 'lastUpdated', customRender: ({ record }) => {
          const status = statuses.value[record.id]
          if (!status) return 'N/A'
          if (status.status === 'error') {
              return h(Tooltip, { title: status.error }, () => h(Tag, { icon: h(CloseCircleOutlined), color: 'error' }, () => '更新失败'))
          }
          return formatTime(status.lastUpdated)
      }
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 120,
    customRender: ({ record }) => (
      h(Space, { size: isMobile.value ? 'small' : 'middle', direction: isMobile.value ? 'vertical' : 'horizontal' }, () => [
        h(Button, { icon: h(EyeOutlined), onClick: () => handlePreview(record) }, () => '预览'),
        h(Button, { icon: h(SyncOutlined), onClick: () => handleUpdate(record.id), loading: statuses.value[record.id]?.status === 'updating' }, () => '更新'),
        h(RouterLink, { to: `/subscriptions/${record.id}` }, () => h(Button, { icon: h(EditOutlined) }, () => '编辑')),
        h(Popconfirm, { title: '确定要删除这个订阅吗？', onConfirm: () => handleDelete(record.id), okText: '确定', cancelText: '取消' }, () => h(Button, { icon: h(DeleteOutlined), danger: true }, () => '删除')),
      ])
    ),
  },
]
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>