<template>
  <a-card>
    <div style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center">
      <a-typography-title :level="3" style="margin: 0">配置文件管理</a-typography-title>
      <router-link to="/profiles/new">
        <a-button type="primary" :icon="$slots.plusOutlined ? $slots.plusOutlined() : ''">
          添加配置文件
        </a-button>
      </router-link>
    </div>
    <a-table :columns="tableColumns" :data-source="profiles" row-key="id" :loading="loading" />

    <a-modal title="订阅二维码" v-model:open="isQrCodeModalVisible" :footer="null" centered>
      <div style="text-align: center; margin-top: 20px">
        <qrcode-vue :value="qrCodeUrl" :size="256" level="H" />
      </div>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CopyOutlined,
  QrcodeOutlined,
  ClusterOutlined,
  WifiOutlined,
} from '@ant-design/icons-vue'
import type { TableProps } from 'ant-design-vue'
import { Profile } from '../types'
import QrcodeVue from 'qrcode.vue'

const profiles = ref<Profile[]>([])
const loading = ref(true)
const origin = ref('')
const isQrCodeModalVisible = ref(false)
const qrCodeUrl = ref('')

onMounted(() => {
  if (typeof window !== 'undefined') {
    origin.value = window.location.origin
  }
  fetchProfiles()
})

const fetchProfiles = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/profiles')
    if (!res.ok) {
      throw new Error(`Failed to fetch profiles: ${res.statusText}`)
    }
    const data = await res.json()
    if (!Array.isArray(data)) {
      throw new Error('API response is not an array')
    }
    profiles.value = data as Profile[]
  } catch (error) {
    console.error('Failed to fetch profiles:', error)
    message.error('加载配置文件列表失败')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id: string) => {
  try {
    await fetch(`/api/profiles/${id}`, { method: 'DELETE' })
    message.success('配置文件删除成功')
    await fetchProfiles()
  } catch (error) {
    console.error('Failed to delete profile:', error)
    message.error('删除配置文件失败')
  }
}

const handleCopy = (text: string) => {
  navigator.clipboard.writeText(text)
  message.success('订阅链接已复制到剪贴板')
}

const showQrCode = (url: string) => {
  qrCodeUrl.value = url
  isQrCodeModalVisible.value = true
}

const tableColumns = computed<TableProps<Profile>['columns']>(() => [
  { title: '名称', dataIndex: 'name', key: 'name' },
  {
    title: '节点数',
    dataIndex: 'nodes',
    key: 'nodes',
    customRender: ({ text: nodes }) => h(Space, null, () => [h(ClusterOutlined), (nodes as string[] | undefined)?.length || 0]),
  },
  {
    title: '订阅数',
    dataIndex: 'subscriptions',
    key: 'subscriptions',
    customRender: ({ text: subscriptions }) => h(Space, null, () => [h(WifiOutlined), (subscriptions as string[] | undefined)?.length || 0]),
  },
  {
    title: '订阅链接',
    key: 'subscribe_url',
    customRender: ({ record }) => {
      if (!origin.value) return null

      const subUrl = record.alias
        ? `${origin.value}/sub/${record.alias}`
        : `${origin.value}/api/subscribe/${record.id}`

      return h(Space, null, () => [
        h(Tooltip, { title: subUrl }, () => h(Button, { icon: h(CopyOutlined), onClick: () => handleCopy(subUrl) })),
        h(Button, { icon: h(QrcodeOutlined), onClick: () => showQrCode(subUrl) }),
      ])
    },
  },
  {
    title: '操作',
    key: 'action',
    customRender: ({ record }) => (
      h(Space, { size: 'middle' }, () => [
        h(RouterLink, { to: `/profiles/${record.id}` }, () => h(Button, { icon: h(EditOutlined) }, () => '编辑')),
        h(Popconfirm,
          { title: '确定要删除这个配置文件吗？', onConfirm: () => handleDelete(record.id), okText: '确定', cancelText: '取消' },
          () => h(Button, { icon: h(DeleteOutlined), danger: true }, () => '删除')
        ),
      ])
    ),
  },
])
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>