<template>
  <div class="hidden sm:block">
    <!-- 桌面端视图 -->
    <a-row :gutter="[16, 16]">
      <a-col :span="24">
        <a-card>
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold">仪表盘</h1>
            <a-button type="primary" @click="refreshData" :loading="loading">刷新</a-button>
          </div>
        </a-card>
      </a-col>

      <a-col :span="24">
        <a-card title="统计">
          <a-row :gutter="16">
            <a-col :span="6">
              <a-statistic title="节点数" :value="stats.nodes" />
            </a-col>
            <a-col :span="6">
              <a-statistic title="订阅数" :value="stats.subscriptions" />
            </a-col>
            <a-col :span="6">
              <a-statistic title="配置文件" :value="stats.profiles" />
            </a-col>
            <a-col :span="6">
              <a-statistic title="在线节点" :value="stats.onlineNodes" />
            </a-col>
          </a-row>
        </a-card>
      </a-col>

      <a-col :span="12">
        <a-card title="最近节点">
          <a-table
            :columns="nodeColumns"
            :data-source="recentNodes"
            :pagination="false"
            size="small"
            :scroll="{ y: 300 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'status'">
                <a-tag v-if="nodeStatus[record.id]?.status === 'online'" :color="getNodeStatusColor(record)">在线 {{ nodeStatus[record.id]?.latency }}ms</a-tag>
                <a-tag v-else-if="nodeStatus[record.id]?.status === 'offline'" color="error">离线</a-tag>
                <a-tag v-else color="default">未知</a-tag>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>

      <a-col :span="12">
        <a-card title="最近配置文件">
          <a-table
            :columns="profileColumns"
            :data-source="recentProfiles"
            :pagination="false"
            size="small"
            :scroll="{ y: 300 }"
          />
        </a-card>
      </a-col>
    </a-row>
  </div>
  <div class="sm:hidden">
    <!-- 移动端视图 -->
    <MobileDashboard />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, Row, Col, Statistic, Table, Button } from 'ant-design-vue'
import type { Node, HealthStatus, Profile } from '@shared/types'
import MobileDashboard from './MobileDashboard.vue'

const loading = ref(false)

const stats = ref({
  nodes: 0,
  subscriptions: 0,
  profiles: 0,
  onlineNodes: 0
})

const recentNodes = ref<Node[]>([])
const recentProfiles = ref<Profile[]>([])
const nodeStatus = ref<Record<string, HealthStatus>>({})

const nodeColumns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '服务器',
    dataIndex: 'server',
    key: 'server'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  }
]

const profileColumns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    customRender: ({ text }: { text: string }) => new Date(text).toLocaleString()
  }
]

const getNodeStatusColor = (node: Node) => {
  const status = nodeStatus.value[node.id]
  if (!status || !status.latency) return 'success'
  if (status.latency < 500) return 'success'
  if (status.latency < 1000) return 'warning'
  return 'error'
}

const refreshData = async () => {
  loading.value = true
  try {
    // 获取统计数据
    const statsRes = await fetch('/api/stats')
    if (statsRes.ok) {
      stats.value = await statsRes.json()
    }

    // 获取最近节点
    const nodesRes = await fetch('/api/nodes?limit=5')
    if (nodesRes.ok) {
      recentNodes.value = await nodesRes.json()
    }

    // 获取最近配置文件
    const profilesRes = await fetch('/api/profiles?limit=5')
    if (profilesRes.ok) {
      recentProfiles.value = await profilesRes.json()
    }

    // 获取节点状态
    const statusRes = await fetch('/api/node-statuses')
    if (statusRes.ok) {
      nodeStatus.value = await statusRes.json()
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshData()
})
</script>