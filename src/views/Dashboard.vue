<template>
  <div class="hidden sm:block p-6">
    <a-row :gutter="[24, 24]">
      <a-col :span="24">
        <a-card class="rounded-xl shadow-sm">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-gray-800 dark:text-white">仪表板</h1>
              <p class="text-gray-500 dark:text-gray-400">欢迎使用 ProSub 管理系统</p>
            </div>
            <a-button 
              type="primary" 
              @click="refreshData" 
              :loading="loading"
              class="flex items-center"
            >
              <template #icon>
                <RedoOutlined />
              </template>
              刷新数据
            </a-button>
          </div>
        </a-card>
      </a-col>

      <a-col :span="24">
        <a-card title="统计概览" class="rounded-xl shadow-sm">
          <a-row :gutter="24">
            <a-col :span="6">
              <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
                <div class="text-blue-500 dark:text-blue-300 flex justify-between">
                  <ClusterOutlined class="text-2xl" />
                  <span class="text-sm">节点</span>
                </div>
                <a-statistic :value="stats.nodes" class="mt-2">
                  <template #prefix>
                    <span class="text-2xl font-bold text-gray-800 dark:text-white">{{ stats.nodes }}</span>
                  </template>
                </a-statistic>
                <div class="text-gray-500 dark:text-gray-400 text-sm mt-1">{{ stats.onlineNodes }} 在线</div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-4 rounded-lg border border-green-100 dark:border-green-900/50">
                <div class="text-green-500 dark:text-green-300 flex justify-between">
                  <FileTextOutlined class="text-2xl" />
                  <span class="text-sm">订阅</span>
                </div>
                <a-statistic :value="stats.subscriptions" class="mt-2">
                  <template #prefix>
                    <span class="text-2xl font-bold text-gray-800 dark:text-white">{{ stats.subscriptions }}</span>
                  </template>
                </a-statistic>
                <div class="text-gray-500 dark:text-gray-400 text-sm mt-1">有效订阅</div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 p-4 rounded-lg border border-amber-100 dark:border-amber-900/50">
                <div class="text-amber-500 dark:text-amber-300 flex justify-between">
                  <ProfileOutlined class="text-2xl" />
                  <span class="text-sm">配置</span>
                </div>
                <a-statistic :value="stats.profiles" class="mt-2">
                  <template #prefix>
                    <span class="text-2xl font-bold text-gray-800 dark:text-white">{{ stats.profiles }}</span>
                  </template>
                </a-statistic>
                <div class="text-gray-500 dark:text-gray-400 text-sm mt-1">已创建</div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-900/30 dark:to-fuchsia-900/30 p-4 rounded-lg border border-purple-100 dark:border-purple-900/50">
                <div class="text-purple-500 dark:text-purple-300 flex justify-between">
                  <WifiOutlined class="text-2xl" />
                  <span class="text-sm">在线率</span>
                </div>
                <a-statistic :value="stats.nodes > 0 ? Math.round((stats.onlineNodes / stats.nodes) * 100) : 0" class="mt-2">
                  <template #prefix>
                    <span class="text-2xl font-bold text-gray-800 dark:text-white">
                      {{ stats.nodes > 0 ? Math.round((stats.onlineNodes / stats.nodes) * 100) : 0 }}%
                    </span>
                  </template>
                </a-statistic>
                <div class="text-gray-500 dark:text-gray-400 text-sm mt-1">节点在线率</div>
              </div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>

      <a-col :span="24">
        <a-card title="快速导航" class="rounded-xl shadow-sm">
          <a-row :gutter="16">
            <a-col :span="4">
              <a-card hoverable class="text-center cursor-pointer rounded-lg" @click="goTo('/nodes')">
                <ClusterOutlined class="text-2xl mb-2 text-blue-500" />
                <div class="font-medium">节点管理</div>
              </a-card>
            </a-col>
            <a-col :span="4">
              <a-card hoverable class="text-center cursor-pointer rounded-lg" @click="goTo('/subscriptions')">
                <WifiOutlined class="text-2xl mb-2 text-green-500" />
                <div class="font-medium">订阅管理</div>
              </a-card>
            </a-col>
            <a-col :span="4">
              <a-card hoverable class="text-center cursor-pointer rounded-lg" @click="goTo('/profiles')">
                <FileTextOutlined class="text-2xl mb-2 text-amber-500" />
                <div class="font-medium">配置管理</div>
              </a-card>
            </a-col>
            <a-col :span="4">
              <a-card hoverable class="text-center cursor-pointer rounded-lg" @click="goTo('/nodes/new')">
                <PlusOutlined class="text-2xl mb-2 text-blue-500" />
                <div class="font-medium">添加节点</div>
              </a-card>
            </a-col>
            <a-col :span="4">
              <a-card hoverable class="text-center cursor-pointer rounded-lg" @click="goTo('/subscriptions/new')">
                <PlusOutlined class="text-2xl mb-2 text-green-500" />
                <div class="font-medium">添加订阅</div>
              </a-card>
            </a-col>
            <a-col :span="4">
              <a-card hoverable class="text-center cursor-pointer rounded-lg" @click="goTo('/profiles/new')">
                <PlusOutlined class="text-2xl mb-2 text-amber-500" />
                <div class="font-medium">新建配置</div>
              </a-card>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>
  </div>
  <div class="sm:hidden">
    <MobileDashboard />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, Row, Col, Statistic, Button } from 'ant-design-vue'
import { 
  RedoOutlined, 
  ClusterOutlined, 
  FileTextOutlined, 
  ProfileOutlined, 
  WifiOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import type { Node, HealthStatus, Profile } from '@shared/types'
import { useRouter } from 'vue-router'
import MobileDashboard from './MobileDashboard.vue'

const router = useRouter()
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

const goTo = (path: string) => {
  router.push(path)
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
:deep(.ant-card-head-title) {
  font-weight: 600;
}
</style>