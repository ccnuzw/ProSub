<template>
  <a-card>
    <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center">
      <h1 style="font-size: 1.5rem; margin: 0">节点管理</h1>
      <a-space>
        <a-button type="default" :icon="$slots.reloadOutlined ? $slots.reloadOutlined() : ''" @click="handleCheckAllNodes" :loading="checkingAll">检查所有节点</a-button>
        <a-button type="default" :icon="$slots.importOutlined ? $slots.importOutlined() : ''" @click="isImportModalVisible = true">导入节点</a-button>
        <a-button v-if="hasUnsavedChanges" type="primary" @click="saveNodes" :loading="importing">保存更改</a-button>
        <a-button type="primary" :icon="$slots.plusOutlined ? $slots.plusOutlined() : ''" @click="navigateTo('/nodes/new')">添加节点</a-button>
      </a-space>
    </div>

    <template v-if="!loading && nodes.length > 0">
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between">
        <a-space>
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
          <span style="margin-left: 8px" v-if="hasSelected">已选择 {{ selectedRowKeys.length }} 项</span>
        </a-space>
        <a-input-search
          placeholder="搜索节点名称、服务器或类型"
          @update:value="searchTerm = $event"
          style="width: 300px"
          allow-clear
        />
      </div>
      <a-table :row-selection="rowSelection" :columns="columns" :data-source="filteredAndSortedNodes" row-key="id" :loading="loading" />
    </template>
    <template v-else>
      <a-empty
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
        description="暂无节点，快去添加一个吧！"
      >
        <a-space>
          <a-button type="primary" :icon="$slots.plusOutlined ? $slots.plusOutlined() : ''" @click="navigateTo('/nodes/new')">手动添加</a-button>
          <a-button :icon="$slots.importOutlined ? $slots.importOutlined() : ''" @click="isImportModalVisible = true">从剪贴板导入</a-button>
        </a-space>
      </a-empty>
    </template>

    <a-modal title="从剪贴板导入节点" v-model:open="isImportModalVisible" @ok="handleImport" @cancel="() => { isImportModalVisible = false; importLinks = ''; }" :confirm-loading="importing" ok-text="导入" cancel-text="取消">
      <p>请粘贴一个或多个节点链接，每行一个。</p>
      <a-textarea :rows="5" v-model:value="importLinks" placeholder="vmess://...&#10;vless://...&#10;ss://..." />

      
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, h } from 'vue'
import { message, Empty, Tag, Space, Button, Popconfirm } from 'ant-design-vue'
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
})

const checkNodeHealth = async (node: Node) => {
  nodeStatus.value = { ...nodeStatus.value, [node.id]: { status: 'checking', timestamp: new Date().toISOString() } }
  try {
    const res = await fetch(`/api/node-health-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ server: node.server, port: node.port, nodeId: node.id })
    })
    const data = (await res.json()) as HealthStatus
    nodeStatus.value = { ...nodeStatus.value, [node.id]: data }
  } catch (error) {
    console.error('Failed to check node health:', error)
    nodeStatus.value = { ...nodeStatus.value, [node.id]: { status: 'offline', timestamp: new Date().toISOString() } }
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

const onSelectChange = (newSelectedRowKeys: string[]) => {
  selectedRowKeys.value = newSelectedRowKeys
}

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: onSelectChange,
}))

const hasSelected = computed(() => selectedRowKeys.value.length > 0)

const columns: TableProps<Node>['columns'] = [
  { title: '名称', dataIndex: 'name', key: 'name', width: '25%' },
  { title: '类型', dataIndex: 'type', key: 'type', width: '10%' },
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
    customRender: ({ record }) => (
      h(Space, { size: 'middle' }, () => [
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