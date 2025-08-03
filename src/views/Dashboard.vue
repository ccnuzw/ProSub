<template>
  <div class="hidden sm:block p-6">
    <!-- 桌面端视图 -->
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

      <a-col :span="12">
        <a-card title="最近节点" class="rounded-xl shadow-sm h-full">
          <template #extra>
            <a-button type="link" @click="goTo('/nodes')">查看全部</a-button>
          </template>
          <a-table
            :columns="nodeColumns"
            :data-source="recentNodes"
            :pagination="false"
            size="middle"
            :scroll="{ y: 300 }"
            class="recent-table"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'name'">
                <span class="font-medium">{{ record.name }}</span>
              </template>
              <template v-else-if="column.dataIndex === 'server'">
                {{ record.server }}:{{ record.port }}
              </template>
              <template v-else-if="column.dataIndex === 'status'">
                <a-tag v-if="nodeStatus[record.id]?.status === 'online'" :color="getNodeStatusColor(record)" class="rounded-full px-2 py-1 text-xs">
                  <CheckCircleOutlined class="mr-1" />
                  {{ nodeStatus[record.id]?.latency ? `${nodeStatus[record.id]?.latency}ms` : '在线' }}
                </a-tag>
                <a-tag v-else-if="nodeStatus[record.id]?.status === 'offline'" color="error" class="rounded-full px-2 py-1 text-xs">
                  <CloseCircleOutlined class="mr-1" />离线
                </a-tag>
                <a-tag v-else color="default" class="rounded-full px-2 py-1 text-xs">
                  <QuestionCircleOutlined class="mr-1" />未知
                </a-tag>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>

      <a-col :span="12">
        <a-card title="最近配置文件" class="rounded-xl shadow-sm h-full">
          <template #extra>
            <a-button type="link" @click="goTo('/profiles')">查看全部</a-button>
          </template>
          <a-table
            :columns="profileColumns"
            :data-source="recentProfiles"
            :pagination="false"
            size="middle"
            :scroll="{ y: 300 }"
            class="recent-table"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'name'">
                <span class="font-medium">{{ record.name }}</span>
              </template>
              <template v-else-if="column.dataIndex === 'info'">
                <span class="text-gray-500 dark:text-gray-400 text-sm">
                  {{ record.nodes.length }} 节点, {{ record.subscriptions.length }} 订阅
                </span>
              </template>
            </template>
          </a-table>
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
import { 
  RedoOutlined, 
  ClusterOutlined, 
  FileTextOutlined, 
  ProfileOutlined, 
  WifiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined
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
    title: '信息',
    dataIndex: 'info',
    key: 'info'
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    customRender: ({ text }: { text: string }) => {
      const date = new Date(text)
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

const goTo = (path: string) => {
  router.push(path)
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.recent-table :deep(.ant-table-thead > tr > th) {
  background-color: transparent !important;
}

.recent-table :deep(.ant-table-tbody > tr:last-child > td) {
  border-bottom: none;
}

:deep(.ant-card-head-title) {
  font-weight: 600;
}
</style>