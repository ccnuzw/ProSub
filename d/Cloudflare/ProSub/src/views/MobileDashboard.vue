<template>
  <div class="space-y-4">
    <a-card class="mobile-card">
      <template #title>
        <div class="flex items-center">
          <DashboardOutlined class="mr-2" />
          <span>仪表盘</span> <!-- 确保这里只有一个标题 -->
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
  </div>
</template>

<script setup lang="ts">
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
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString()
}

onMounted(() => {
  // Fetch data for mobile dashboard
})
</script>