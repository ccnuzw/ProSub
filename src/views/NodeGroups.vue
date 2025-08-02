<template>
  <a-card>
    <div class="mb-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold">节点分组</h1>
      <a-button type="primary" @click="goTo('/node-groups/new')">创建分组</a-button>
    </div>

    <a-table
      v-if="nodeGroups.length > 0"
      :columns="columns"
      :data-source="nodeGroups"
      row-key="id"
      :loading="loading"
      :scroll="{ x: 'max-content' }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'nodeCount'">
          {{ record.nodeIds.length }}
        </template>
        <template v-else-if="column.dataIndex === 'actions'">
          <span class="flex space-x-2">
            <a-button type="link" @click="goTo(`/node-groups/${record.id}`)">编辑</a-button>
            <a-popconfirm
              title="确定要删除这个分组吗？"
              @confirm="handleDelete(record.id)"
              ok-text="确定"
              cancel-text="取消"
            >
              <a-button type="link" danger>删除</a-button>
            </a-popconfirm>
          </span>
        </template>
      </template>
    </a-table>

    <a-empty v-else-if="!loading && nodeGroups.length === 0" description="暂无节点分组">
      <a-button type="primary" @click="goTo('/node-groups/new')">创建分组</a-button>
    </a-empty>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message, Table, Empty, Popconfirm } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { NodeGroup } from '@shared/types'

const router = useRouter()
const goTo = (path: string) => router.push(path)

const nodeGroups = ref<NodeGroup[]>([])
const loading = ref(true)

const columns = [
  {
    title: '分组名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '节点数量',
    dataIndex: 'nodeCount',
    key: 'nodeCount'
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    customRender: ({ text }: { text: string }) => new Date(text).toLocaleString()
  },
  {
    title: '操作',
    dataIndex: 'actions',
    key: 'actions'
  }
]

const fetchNodeGroups = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/node-groups')
    if (res.ok) {
      nodeGroups.value = await res.json()
    } else {
      throw new Error('Failed to fetch node groups')
    }
  } catch (error) {
    console.error('Failed to fetch node groups:', error)
    message.error('获取节点分组失败')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id: string) => {
  try {
    const res = await fetch(`/api/node-groups/${id}`, { method: 'DELETE' })
    if (res.ok) {
      message.success('删除成功')
      nodeGroups.value = nodeGroups.value.filter(group => group.id !== id)
    } else {
      throw new Error('Failed to delete node group')
    }
  } catch (error) {
    console.error('Failed to delete node group:', error)
    message.error('删除失败')
  }
}

onMounted(() => {
  fetchNodeGroups()
})
</script>