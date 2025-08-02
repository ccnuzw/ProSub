<template>
  <a-card>
    <div class="mb-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold">规则集</h1>
      <a-button type="primary" @click="goTo('/rule-sets/new')">创建规则集</a-button>
    </div>

    <a-table
      v-if="ruleSets.length > 0"
      :columns="columns"
      :data-source="ruleSets"
      row-key="id"
      :loading="loading"
      :scroll="{ x: 'max-content' }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'clientType'">
          <a-tag v-if="record.clientType === 'clash'">Clash</a-tag>
          <a-tag v-else-if="record.clientType === 'surge'">Surge</a-tag>
          <a-tag v-else-if="record.clientType === 'quantumultx'">Quantumult X</a-tag>
          <a-tag v-else-if="record.clientType === 'loon'">Loon</a-tag>
          <a-tag v-else-if="record.clientType === 'sing-box'">Sing-Box</a-tag>
          <a-tag v-else>通用</a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'actions'">
          <span class="flex space-x-2">
            <a-button type="link" @click="goTo(`/rule-sets/${record.id}`)">编辑</a-button>
            <a-popconfirm
              title="确定要删除这个规则集吗？"
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

    <a-empty v-else-if="!loading && ruleSets.length === 0" description="暂无规则集">
      <a-button type="primary" @click="goTo('/rule-sets/new')">创建规则集</a-button>
    </a-empty>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message, Table, Empty, Popconfirm, Tag } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { CustomRuleSet } from '@shared/types'

const router = useRouter()
const goTo = (path: string) => router.push(path)

const ruleSets = ref<CustomRuleSet[]>([])
const loading = ref(true)

const columns = [
  {
    title: '规则集名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description'
  },
  {
    title: '客户端类型',
    dataIndex: 'clientType',
    key: 'clientType'
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

const fetchRuleSets = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/rule-sets')
    if (res.ok) {
      ruleSets.value = await res.json()
    } else {
      throw new Error('Failed to fetch rule sets')
    }
  } catch (error) {
    console.error('Failed to fetch rule sets:', error)
    message.error('获取规则集失败')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id: string) => {
  try {
    const res = await fetch(`/api/rule-sets/${id}`, { method: 'DELETE' })
    if (res.ok) {
      message.success('删除成功')
      ruleSets.value = ruleSets.value.filter(ruleSet => ruleSet.id !== id)
    } else {
      throw new Error('Failed to delete rule set')
    }
  } catch (error) {
    console.error('Failed to delete rule set:', error)
    message.error('删除失败')
  }
}

onMounted(() => {
  fetchRuleSets()
})
</script>