<template>
  <a-card>
    <div style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center">
      <a-typography-title :level="3" style="margin: 0">用户管理</a-typography-title>
      <router-link to="/user/new">
        <a-button type="primary" :icon="$slots.plusOutlined ? $slots.plusOutlined() : ''">
          添加用户
        </a-button>
      </router-link>
    </div>
    <a-table :columns="columns" :data-source="users" row-key="id" :loading="loading" />
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { message, Space, Popconfirm, Button, Card, Typography, Tooltip } from 'ant-design-vue'
import { RouterLink } from 'vue-router'
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CopyOutlined,
} from '@ant-design/icons-vue'
import type { TableProps } from 'ant-design-vue'
import { User } from '../types'

const users = ref<User[]>([])
const loading = ref(true)

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/users')
    const data = (await res.json()) as User[]
    users.value = data
  } catch (error) {
    console.error('Failed to fetch users:', error)
    message.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})

const handleDelete = async (id: string) => {
  if (id === 'admin') {
    message.error('不能删除默认的 admin 用户')
    return
  }
  try {
    await fetch(`/api/users/${id}`, { method: 'DELETE' })
    message.success('用户删除成功')
    fetchUsers()
  } catch (error) {
    console.error('Failed to delete user:', error)
    message.error('删除用户失败')
  }
}

const handleCopy = (text: string) => {
  navigator.clipboard.writeText(text)
  message.success('用户ID已复制')
}

const columns: TableProps<User>['columns'] = [
  { title: '用户名', dataIndex: 'name', key: 'name' },
  {
    title: '用户ID',
    dataIndex: 'id',
    key: 'id',
    customRender: ({ text: id }) => (
      h(Space, null, () => [
        h('span', {}, () => `${(id as string).substring(0, 8)}...`),
        h(Tooltip, { title: '复制完整ID' }, () => h(Button, { shape: 'circle', icon: h(CopyOutlined), size: 'small', onClick: () => handleCopy(id as string) })),
      ])
    ),
  },
  { title: '关联配置文件数', dataIndex: 'profiles', key: 'profiles', customRender: ({ text: profiles }) => (profiles as string[])?.length || 0 },
  {
    title: '操作',
    key: 'action',
    customRender: ({ record }) => (
      h(Space, { size: 'middle' }, () => [
        h(RouterLink, { to: `/user/${record.id}` }, () => h(Button, { icon: h(EditOutlined) }, () => '编辑')),
        h(Popconfirm,
          { title: '确定要删除这个用户吗？', onConfirm: () => handleDelete(record.id), okText: '确定', cancelText: '取消', disabled: record.id === 'admin' },
          () => h(Button, { icon: h(DeleteOutlined), danger: true, disabled: record.id === 'admin' }, () => '删除')
        ),
      ])
    ),
  },
]
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>