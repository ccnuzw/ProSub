<template>
  <div class="space-y-4">
    <a-card class="mobile-card">
      <template #title>
        <div class="flex items-center">
          <DashboardOutlined class="mr-2" />
          <span>系统概览</span>
        </div>
      </template>
      <div class="grid grid-cols-2 gap-4">
        <a-statistic title="节点数" :value="stats.nodes" />
        <a-statistic title="订阅数" :value="stats.subscriptions" />
        <a-statistic title="配置文件" :value="stats.profiles" />
        <a-statistic title="在线节点" :value="stats.onlineNodes" />
      </div>
    </a-card>

    <a-card class="mobile-card">
      <template #title>
        <div class="flex items-center">
          <ClusterOutlined class="mr-2" />
          <span>最近节点</span>
        </div>
      </template>
      <div v-if="recentNodes.length > 0" class="space-y-3">
        <div 
          v-for="node in recentNodes" 
          :key="node.id"
          class="border-b border-gray-200 pb-3 last:border-0 last:pb-0"
        >
          <div class="font-medium">{{ node.name }}</div>
          <div class="flex justify-between items-center mt-1">
            <span class="text-sm text-gray-500">{{ node.server }}:{{ node.port }}</span>
            <a-tag :color="getNodeStatusColor(node)" class="text-xs">
              {{ nodeStatus[node.id]?.latency ? `${nodeStatus[node.id].latency}ms` : '未知' }}
            </a-tag>
          </div>
        </div>
      </div>
      <a-empty v-else description="暂无节点" />
    </a-card>

    <a-card class="mobile-card">
      <template #title>
        <div class="flex items-center">
          <FileTextOutlined class="mr-2" />
          <span>最近配置文件</span>
        </div>
      </template>
      <div v-if="recentProfiles.length > 0" class="space-y-3">
        <div 
          v-for="profile in recentProfiles" 
          :key="profile.id"
          class="border-b border-gray-200 pb-3 last:border-0 last:pb-0"
        >
          <div class="font-medium">{{ profile.name }}</div>
          <div class="flex justify-between items-center mt-1">
            <span class="text-sm text-gray-500">
              {{ profile.nodes.length }} 节点, {{ profile.subscriptions.length }} 订阅
            </span>
            <span class="text-xs text-gray-500">
              {{ formatTime(profile.updatedAt) }}
            </span>
          </div>
        </div>
      </div>
      <a-empty v-else description="暂无配置文件" />
    </a-card>

    <a-card class="mobile-card">
      <template #title>
        <div class="flex items-center">
          <WifiOutlined class="mr-2" />
          <span>快速操作</span>
        </div>
      </template>
      <div class="grid grid-cols-3 gap-3">
        <a-button type="primary" @click="goTo('/nodes/new')" class="flex flex-col items-center">
          <PlusOutlined class="text-lg" />
          <span class="text-xs mt-1">添加节点</span>
        </a-button>
        <a-button type="primary" @click="goTo('/subscriptions/new')" class="flex flex-col items-center">
          <PlusOutlined class="text-lg" />
          <span class="text-xs mt-1">添加订阅</span>
        </a-button>
        <a-button type="primary" @click="goTo('/profiles/new')" class="flex flex-col items-center">
          <PlusOutlined class="text-lg" />
          <span class="text-xs mt-1">新建配置</span>
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, Statistic, Empty, Tag } from 'ant-design-vue'
import { 
  DashboardOutlined, 
  ClusterOutlined, 
  FileTextOutlined, 
  WifiOutlined, 
  PlusOutlined 
} from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { Node, HealthStatus, Profile } from '../types'

const router = useRouter()
const goTo = (path: string) => {
  router.push(path)
}

const stats = ref({
  nodes: 0,
  subscriptions: 0,
  profiles: 0,
  onlineNodes: 0
})

const recentNodes = ref<Node[]>([])
const recentProfiles = ref<Profile[]>([])
const nodeStatus = ref<Record<string, HealthStatus>>({})

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}

const getNodeStatusColor = (node: Node) => {
  const status = nodeStatus.value[node.id]
  if (!status || !status.latency) return 'default'
  if (status.latency < 500) return 'success'
  if (status.latency < 1000) return 'warning'
  return 'error'
}

const fetchDashboardData = async () => {
  try {
    // 获取节点数据
    const nodesRes = await fetch('/api/nodes')
    if (nodesRes.ok) {
      const nodes = await nodesRes.json()
      recentNodes.value = nodes.slice(0, 5)
      stats.value.nodes = nodes.length
    }

    // 获取订阅数据
    const subsRes = await fetch('/api/subscriptions')
    if (subsRes.ok) {
      const subscriptions = await subsRes.json()
      stats.value.subscriptions = subscriptions.length
    }

    // 获取配置文件数据
    const profilesRes = await fetch('/api/profiles')
    if (profilesRes.ok) {
      const profiles = await profilesRes.json()
      recentProfiles.value = profiles.slice(0, 5)
      stats.value.profiles = profiles.length
    }

    // 获取节点状态
    const statusRes = await fetch('/api/node-statuses')
    if (statusRes.ok) {
      nodeStatus.value = await statusRes.json()
      stats.value.onlineNodes = Object.values(nodeStatus.value).filter(s => s.status === 'online').length
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.dark .border-gray-200 {
  border-color: #444;
}
</style>