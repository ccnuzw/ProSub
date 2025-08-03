<template>
  <div class="space-y-4 p-4">
    <div class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
      <h1 class="text-2xl font-bold">欢迎回来</h1>
      <p class="opacity-90 mt-1">ProSub 管理面板</p>
      <div class="flex items-center mt-4">
        <a-button 
          type="primary" 
          ghost 
          @click="refreshData" 
          :loading="loading"
          class="flex items-center bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/50"
        >
          <template #icon>
            <RedoOutlined />
          </template>
          刷新
        </a-button>
      </div>
    </div>

    <a-card class="mobile-card rounded-2xl shadow-sm">
      <template #title>
        <div class="font-bold text-lg">统计概览</div>
      </template>
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
          <div class="text-blue-500 dark:text-blue-300 flex justify-between">
            <ClusterOutlined class="text-xl" />
          </div>
          <div class="mt-2">
            <div class="text-2xl font-bold text-gray-800 dark:text-white">{{ stats.nodes }}</div>
            <div class="text-gray-500 dark:text-gray-400 text-sm">节点</div>
          </div>
          <div class="text-green-500 text-xs mt-1">{{ stats.onlineNodes }} 在线</div>
        </div>
        
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-4 rounded-xl border border-green-100 dark:border-green-900/50">
          <div class="text-green-500 dark:text-green-300 flex justify-between">
            <FileTextOutlined class="text-xl" />
          </div>
          <div class="mt-2">
            <div class="text-2xl font-bold text-gray-800 dark:text-white">{{ stats.subscriptions }}</div>
            <div class="text-gray-500 dark:text-gray-400 text-sm">订阅</div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 p-4 rounded-xl border border-amber-100 dark:border-amber-900/50">
          <div class="text-amber-500 dark:text-amber-300 flex justify-between">
            <ProfileOutlined class="text-xl" />
          </div>
          <div class="mt-2">
            <div class="text-2xl font-bold text-gray-800 dark:text-white">{{ stats.profiles }}</div>
            <div class="text-gray-500 dark:text-gray-400 text-sm">配置</div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/30 dark:to-fuchsia-900/30 p-4 rounded-xl border border-purple-100 dark:border-purple-900/50">
          <div class="text-purple-500 dark:text-purple-300 flex justify-between">
            <WifiOutlined class="text-xl" />
          </div>
          <div class="mt-2">
            <div class="text-2xl font-bold text-gray-800 dark:text-white">
              {{ stats.nodes > 0 ? Math.round((stats.onlineNodes / stats.nodes) * 100) : 0 }}%
            </div>
            <div class="text-gray-500 dark:text-gray-400 text-sm">在线率</div>
          </div>
        </div>
      </div>
    </a-card>

    <a-card class="mobile-card rounded-2xl shadow-sm">
      <template #title>
        <div class="flex items-center">
          <ClusterOutlined class="mr-2 text-blue-500" />
          <span class="font-bold">最近节点</span>
        </div>
      </template>
      <template #extra>
        <a-button type="link" size="small" @click="goTo('/nodes')">更多</a-button>
      </template>
      <div v-if="recentNodes.length > 0" class="space-y-3">
        <div 
          v-for="node in recentNodes" 
          :key="node.id"
          class="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-2 py-1 transition-colors"
        >
          <div class="font-medium text-gray-800 dark:text-white">{{ node.name }}</div>
          <div class="flex justify-between items-center mt-1">
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ node.server }}:{{ node.port }}</span>
            <a-tag :color="getNodeStatusColor(node)" class="rounded-full px-2 py-1 text-xs">
              <CheckCircleOutlined v-if="nodeStatus[node.id]?.status === 'online'" class="mr-1" />
              <CloseCircleOutlined v-else-if="nodeStatus[node.id]?.status === 'offline'" class="mr-1" />
              <QuestionCircleOutlined v-else class="mr-1" />
              {{ nodeStatus[node.id]?.latency ? `${nodeStatus[node.id].latency}ms` : '未知' }}
            </a-tag>
          </div>
        </div>
      </div>
      <a-empty v-else description="暂无节点" />
    </a-card>

    <a-card class="mobile-card rounded-2xl shadow-sm">
      <template #title>
        <div class="flex items-center">
          <FileTextOutlined class="mr-2 text-green-500" />
          <span class="font-bold">最近配置文件</span>
        </div>
      </template>
      <template #extra>
        <a-button type="link" size="small" @click="goTo('/profiles')">更多</a-button>
      </template>
      <div v-if="recentProfiles.length > 0" class="space-y-3">
        <div 
          v-for="profile in recentProfiles" 
          :key="profile.id"
          class="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-2 py-1 transition-colors"
        >
          <div class="font-medium text-gray-800 dark:text-white">{{ profile.name }}</div>
          <div class="flex justify-between items-center mt-1">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ profile.nodes.length }} 节点, {{ profile.subscriptions.length }} 订阅
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatTime(profile.updatedAt) }}
            </span>
          </div>
        </div>
      </div>
      <a-empty v-else description="暂无配置文件" />
    </a-card>

    <a-card class="mobile-card rounded-2xl shadow-sm">
      <template #title>
        <div class="flex items-center">
          <ThunderboltOutlined class="mr-2 text-amber-500" />
          <span class="font-bold">快速操作</span>
        </div>
      </template>
      <div class="grid grid-cols-3 gap-3">
        <a-button 
          type="primary" 
          @click="goTo('/nodes/new')" 
          class="flex flex-col items-center h-auto py-3 rounded-xl"
        >
          <PlusOutlined class="text-lg" />
          <span class="text-xs mt-1">添加节点</span>
        </a-button>
        <a-button 
          type="primary" 
          @click="goTo('/subscriptions/new')" 
          class="flex flex-col items-center h-auto py-3 rounded-xl"
        >
          <PlusOutlined class="text-lg" />
          <span class="text-xs mt-1">添加订阅</span>
        </a-button>
        <a-button 
          type="primary" 
          @click="goTo('/profiles/new')" 
          class="flex flex-col items-center h-auto py-3 rounded-xl"
        >
          <PlusOutlined class="text-lg" />
          <span class="text-xs mt-1">新建配置</span>
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, Statistic, Empty, Tag, Button } from 'ant-design-vue'
import { 
  DashboardOutlined, 
  ClusterOutlined, 
  FileTextOutlined, 
  WifiOutlined,
  PlusOutlined,
  RedoOutlined,
  ProfileOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons-vue'
import type { Node, HealthStatus, Profile } from '../../packages/shared/types/index.ts'
import { useRouter } from 'vue-router'

const router = useRouter()
const goTo = (path: string) => router.push(path)

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

const getNodeStatusColor = (node: Node) => {
  const status = nodeStatus.value[node.id]
  if (!status || !status.latency) return 'success'
  if (status.latency < 500) return 'success'
  if (status.latency < 1000) return 'warning'
  return 'error'
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 1) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays <= 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString()
  }
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