<template>
  <div class="hidden sm:block">
    <!-- 桌面端视图保持不变 -->
    <a-card>
      <div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 class="text-xl sm:text-2xl font-bold mb-2 sm:mb-0">节点管理</h1>
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <div class="flex flex-col sm:flex-row gap-2">
            <a-button type="default" :icon="h(ReloadOutlined)" @click="handleCheckAllNodes" :loading="checkingAll">检查所有节点</a-button>
            <a-button type="default" :icon="h(ImportOutlined)" @click="isImportModalVisible = true">导入节点</a-button>
          </div>
          <div class="flex flex-col sm:flex-row gap-2">
            <a-button v-if="hasUnsavedChanges" type="primary" @click="saveNodes" :loading="importing">保存更改</a-button>
            <a-button type="primary" :icon="h(PlusOutlined)" @click="navigateTo('/nodes/new')">添加节点</a-button>
          </div>
        </div>
      </div>

      <template v-if="!loading && nodes.length > 0">
        <div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <div class="flex flex-col sm:flex-row gap-2">
              <a-popconfirm
                :title="`确定要删除选中的 ${selectedRowKeys.length} 个节点吗？`"
                @confirm="handleBatchDelete"
                ok-text="确定"
                cancel-text="取消"
                :disabled="!hasSelected"
              >
                <a-button type="primary" danger :disabled="!hasSelected">删除选中</a-button>
              </a-popconfirm>
              <a-popconfirm
                title="确定要清空所有节点吗？此操作不可撤销！"
                @confirm="handleClearAllNodes"
                ok-text="确定"
                cancel-text="取消"
              >
                <a-button type="primary" danger>一键清空</a-button>
              </a-popconfirm>
            </div>
            <span class="ml-2" v-if="hasSelected">已选择 {{ selectedRowKeys.length }} 项</span>
          </div>
          <a-input-search
            placeholder="搜索节点名称、服务器或类型"
            @update:value="searchTerm = $event"
            class="w-full sm:w-72 mt-2 sm:mt-0"
            allow-clear
          />
        </div>

        <!-- Desktop Table View -->
        <a-table
        v-if="!isMobile"
        :row-selection="rowSelection"
        :columns="columns"
        :data-source="paginatedNodes"
        row-key="id"
        :loading="loading"
        :scroll="{ x: 'max-content' }"
        :pagination="{
          current: currentNodesPage,
          pageSize: nodesPageSize,
          total: filteredAndSortedNodes.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `显示 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          onShowSizeChange: (current, size) => { nodesPageSize = size; currentNodesPage = 1; },
          onChange: (page) => { currentNodesPage = page; },
        }"
      />

        <!-- Mobile Card View -->
        <div v-else class="grid grid-cols-1 gap-4">
          <a-card v-for="node in paginatedNodes" :key="node.id" :title="node.name" size="small">
            <p><strong>类型:</strong> <a-tag :color="getNodeTypeColor(node.type)">{{ node.type }}</a-tag></p>
            <p><strong>服务器:</strong> {{ node.server }}</p>
            <p><strong>端口:</strong> {{ node.port }}</p>
            <p><strong>状态:</strong>
              <template v-if="nodeStatus[node.id]">
                <a-tag v-if="nodeStatus[node.id].status === 'checking'" :icon="h(SyncOutlined, { spin: true })" color="processing">检查中...</a-tag>
                <a-tag v-else-if="nodeStatus[node.id].status === 'offline'" :icon="h(CloseCircleOutlined)" color="error">离线</a-tag>
                <a-tag v-else-if="nodeStatus[node.id].status === 'online'" :icon="h(CheckCircleOutlined)" :color="nodeStatus[node.id].latency && nodeStatus[node.id].latency > 1000 ? 'error' : (nodeStatus[node.id].latency && nodeStatus[node.id].latency > 500 ? 'warning' : 'success')">
                  {{ nodeStatus[node.id].latency ? `${nodeStatus[node.id].latency} ms` : '在线' }}
                </a-tag>
                <a-tag v-else>未知</a-tag>
              </template>
              <template v-else>
                <a-tag>未知</a-tag>
              </template>
            </p>
            <template #actions>
              <a-button type="text" :icon="h(ReloadOutlined)" @click="checkNodeHealth(node)" :loading="nodeStatus[node.id]?.status === 'checking'">检查</a-button>
              <a-button type="text" :icon="h(EditOutlined)" @click="navigateTo(`/nodes/${node.id}`)">编辑</a-button>
              <a-popconfirm title="确定要删除这个节点吗？" @confirm="handleDelete(node.id)" ok-text="确定" cancel-text="取消">
                <a-button type="text" danger :icon="h(DeleteOutlined)">删除</a-button>
              </a-popconfirm>
            </template>
          </a-card>
          <a-pagination
            v-if="filteredAndSortedNodes.length > nodesPageSize"
            v-model:current="currentNodesPage"
            :page-size="nodesPageSize"
            :total="filteredAndSortedNodes.length"
            show-less-items
            class="mt-4 text-center"
          />
          </div>
      </template>
      <template v-else>
        <a-empty
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="暂无节点，快去添加一个吧！"
        >
          <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <a-button type="primary" :icon="h(PlusOutlined)" @click="navigateTo('/nodes/new')">手动添加</a-button>
            <a-button :icon="h(ImportOutlined)" @click="isImportModalVisible = true">从剪贴板导入</a-button>
          </div>
        </a-empty>
      </template>

      <a-modal title="从剪贴板导入节点" v-model:open="isImportModalVisible" @ok="handleImport" @cancel="() => { isImportModalVisible = false; importLinks = ''; }" :confirm-loading="importing" ok-text="导入" cancel-text="取消">
        <p>请粘贴一个或多个节点链接，每行一个。</p>
        <a-textarea :rows="5" v-model:value="importLinks" placeholder="vmess://...&#10;vless://...&#10;ss://..." />
      </a-modal>
    </a-card>
  </div>
  <div class="sm:hidden">
    <!-- 移动端视图 -->
    <MobileNodes />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, h, onBeforeUnmount } from 'vue'
import { message, Empty, Tag, Space, Button, Popconfirm, Card, Modal } from 'ant-design-vue'
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ReloadOutlined,
  ImportOutlined,
} from '@ant-design/icons-vue'
import type { TableProps } from 'ant-design-vue'
import { Node, HealthStatus } from '../types'
import { parseNodeLink as parseNode } from '@shared/node-parser'

import { useRouter } from 'vue-router'
import MobileNodes from './MobileNodes.vue'

const router = useRouter()
const navigateTo = (path: string) => {
  router.push(path)
}

const nodes = ref<Node[]>([])
const loading = ref(true)
const nodeStatus = ref<Record<string, HealthStatus>>({})
const checkingAll = ref(false)
const selectedRowKeys = ref<string[]>([])

const isImportModalVisible = ref(false)
const importLinks = ref('')
const importing = ref(false)
const searchTerm = ref('')
const hasUnsavedChanges = ref(false)

const currentNodesPage = ref(1)
const nodesPageSize = computed(() => isMobile.value ? 5 : 10);

const isMobile = ref(window.innerWidth < 640) // Tailwind's sm breakpoint is 640px

const handleResize = () => {
  isMobile.value = window.innerWidth < 640
}

const fetchNodesAndStatuses = async () => {
  loading.value = true
  try {
    const [nodesRes, statusesRes] = await Promise.all([
      fetch('/api/nodes'),
      fetch('/api/node-statuses'),
    ])
    const nodesData = (await nodesRes.json()) as Node[]
    const statusesData = (await statusesRes.json()) as Record<string, HealthStatus>
    nodes.value = nodesData
    nodeStatus.value = statusesData
  } catch (error) {
    message.error('加载节点列表或状态失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchNodesAndStatuses()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

const checkNodeHealth = async (node: Node) => {
  nodeStatus.value = { ...nodeStatus.value, [node.id]: { status: 'checking', timestamp: new Date().toISOString() } }
  try {
    const res = await fetch(`/api/node-health-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ server: node.server, port: node.port, nodeId: node.id })
    })
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Unknown error');
    }
    const data = (await res.json()) as HealthStatus
    nodeStatus.value = { ...nodeStatus.value, [node.id]: data }
  } catch (error) {
    console.error('Failed to check node health:', error)
    nodeStatus.value = { ...nodeStatus.value, [node.id]: { status: 'offline', timestamp: new Date().toISOString(), error: error instanceof Error ? error.message : String(error) } }
  }
}

const handleCheckAllNodes = async () => {
  checkingAll.value = true
  await Promise.allSettled(nodes.value.map(node => checkNodeHealth(node)))
  checkingAll.value = false
  message.success('所有节点健康检查完成')
}

const handleDelete = async (id: string) => {
  try {
    await fetch(`/api/nodes/${id}`, { method: 'DELETE' })
    message.success('节点删除成功')
    fetchNodesAndStatuses()
  } catch (error) {
    console.error('Failed to delete node:', error)
    message.error('删除节点失败')
  }
}

const handleBatchDelete = async () => {
  try {
    await fetch(`/api/nodes/batch-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedRowKeys.value }),
    })
    message.success(`成功删除 ${selectedRowKeys.value.length} 个节点`)
    selectedRowKeys.value = []
    fetchNodesAndStatuses()
  } catch (error) {
    console.error('Failed to batch delete nodes:', error)
    message.error('批量删除失败')
  }
}

const handleImport = async () => {
  isImportModalVisible.value = false;
  const newNodes: Node[] = [];
  const lines = importLinks.value.split('\n').filter(line => line.trim() !== '');
  lines.forEach((line, index) => {
    try {
      const node = parseNode(line);
      newNodes.push({ ...node, id: `temp-${Date.now()}-${index}` }); // Add a temporary ID for keying
    } catch (error) {
      console.error(`Error parsing line ${index + 1}: ${line}`, error);
      // Optionally, add some visual feedback for parsing errors
    }
  });

  if (newNodes.length > 0) {
    nodes.value = [...nodes.value, ...newNodes];
    hasUnsavedChanges.value = true;
    message.info(`已导入 ${newNodes.length} 个节点，请点击“保存更改”按钮保存。`);
  }
  importLinks.value = '';
};

const handleClearAllNodes = async () => {
  try {
    const res = await fetch('/api/nodes/clear-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = (await res.json()) as { message: string };
    if (!res.ok) {
      throw new Error(result.message || '清空失败');
    }
    message.success(result.message || '所有节点已清空。');
    hasUnsavedChanges.value = false;
    await fetchNodesAndStatuses(); // Refresh the list from the backend
  } catch (error) {
    if(error instanceof Error) {
      message.error(error.message);
    } else {
      message.error('清空节点失败');
    }
  }
};

const saveNodes = async () => {
  importing.value = true; // Re-using importing flag for saving
  try {
    const newNodes = nodes.value.filter(node => node.id.startsWith('temp-'));
    if (newNodes.length === 0) {
      message.info('没有新的节点需要保存。');
      return;
    }
    const res = await fetch('/api/nodes/batch-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes: newNodes }), // Send the actual node objects
    });
    const result = (await res.json()) as { message: string };
    if (!res.ok) {
      throw new Error(result.message || '保存失败');
    }
    message.success(result.message || `成功保存 ${newNodes.length} 个节点`);
    hasUnsavedChanges.value = false;
    await fetchNodesAndStatuses(); // Refresh the list from the backend
  } catch (error) {
    if(error instanceof Error) {
      message.error(error.message);
    } else {
      message.error('保存节点失败');
    }
  } finally {
    importing.value = false;
  }
};

const filteredAndSortedNodes = computed(() => {
  currentNodesPage.value = 1; // Reset page when filter/sort changes
  const filtered = nodes.value.filter(node => {
      const term = searchTerm.value.toLowerCase()
      return (
          node.name.toLowerCase().includes(term) ||
          node.server.toLowerCase().includes(term) ||
          node.type.toLowerCase().includes(term)
      )
  })
  const statusOrder: Record<string, number> = { 'online': 1, 'checking': 2, 'unknown': 3, 'offline': 4 }
  return filtered.sort((a, b) => {
    const statusA = nodeStatus.value[a.id] || { status: 'unknown' }
    const statusB = nodeStatus.value[b.id] || { status: 'unknown' }
    const orderA = statusOrder[statusA.status] || 99
    const orderB = statusOrder[statusB.status] || 99
    if (orderA !== orderB) return orderA - orderB
    if (statusA.status === 'online' && statusB.status === 'online') {
      const latencyA = statusA.latency ?? Infinity
      const latencyB = statusB.latency ?? Infinity
      if (latencyA !== latencyB) return latencyA - latencyB
    }
    return a.name.localeCompare(b.name)
  })
})

const paginatedNodes = computed(() => {
  const start = (currentNodesPage.value - 1) * nodesPageSize.value
  const end = start + nodesPageSize.value
  return filteredAndSortedNodes.value.slice(start, end)
})

const onSelectChange = (newSelectedRowKeys: string[]) => {
  selectedRowKeys.value = newSelectedRowKeys
}

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: onSelectChange,
}))

const hasSelected = computed(() => selectedRowKeys.value.length > 0)

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

const columns: TableProps<Node>['columns'] = [
  {
    title: '序号',
    key: 'index',
    width: '5%',
    customRender: ({ index }) => (currentNodesPage.value - 1) * nodesPageSize.value + index + 1,
  },
  { title: '名称', dataIndex: 'name', key: 'name', width: '20%' },
  { 
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: '10%',
    customRender: ({ text: type }) => h(Tag, { color: getNodeTypeColor(type) }, () => type),
  },
  { title: '服务器', dataIndex: 'server', key: 'server', width: '25%' },
  { title: '端口', dataIndex: 'port', key: 'port', width: '10%' },
  { 
    title: '状态',
    key: 'status',
    width: '15%',
    customRender: ({ record }) => {
      const statusInfo = nodeStatus.value[record.id]
      if (!statusInfo) return h(Tag, null, () => '未知')
      if (statusInfo.status === 'checking') return h(Tag, { icon: h(SyncOutlined, { spin: true }), color: 'processing' }, () => '检查中...')
      if (statusInfo.status === 'offline') return h(Tag, { icon: h(CloseCircleOutlined), color: 'error' }, () => '离线')
      if (statusInfo.status === 'online') {
          const latency = statusInfo.latency
          let color = 'success'
          if(latency && latency > 500) color = 'warning'
          if(latency && latency > 1000) color = 'error'
          return h(Tag, { icon: h(CheckCircleOutlined), color: color }, () => (latency ? `${latency} ms` : '在线'))
      }
      return h(Tag, null, () => '未知')
    },
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 120,
    customRender: ({ record }) => (
      h(Space, { size: isMobile.value ? 'small' : 'middle', direction: isMobile.value ? 'vertical' : 'horizontal' }, () => [
        h(Button, { icon: h(ReloadOutlined), onClick: () => checkNodeHealth(record), loading: nodeStatus.value[record.id]?.status === 'checking' }, () => '检查'),
        h(Button, { icon: h(EditOutlined), onClick: () => navigateTo(`/nodes/${record.id}`) }, () => '编辑'),
        h(Popconfirm, { title: '确定要删除这个节点吗？', onConfirm: () => handleDelete(record.id), okText: '确定', cancelText: '取消' }, () => h(Button, { icon: h(DeleteOutlined), danger: true }, () => '删除')),
      ])
    ),
  },
]

</script>


<style scoped>
/* 可以根据需要添加样式 */
</style>