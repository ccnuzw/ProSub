<template>
  <a-spin :spinning="loading">
    <a-row :gutter="[24, 24]">
      <a-col :xs="24" :sm="12" :md="6" v-for="item in statsItems" :key="item.title">
        <a-card :bordered="false" class="statistic-card">
          <div class="flex items-center">
            <div :class="[item.iconBgClass, 'icon-wrapper']">
              <component :is="item.icon" :class="[item.iconColorClass, 'text-2xl']" />
            </div>
            <div class="ml-4">
              <div class="text-gray-500 dark:text-gray-400">{{ item.title }}</div>
              <div class="text-2xl font-bold">{{ item.value }}</div>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :span="24">
        <a-card title="快速导航" :bordered="false">
          <a-row :gutter="[16, 16]">
            <a-col :xs="12" :sm="8" :md="4" v-for="nav in navItems" :key="nav.title">
              <div class="nav-card" @click="goTo(nav.path)">
                <div :class="[nav.iconBgClass, 'nav-icon-wrapper']">
                  <component :is="nav.icon" :class="[nav.iconColorClass, 'text-xl']" />
                </div>
                <span class="mt-2 text-sm">{{ nav.title }}</span>
              </div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>

       <a-col :xs="24" class="sm:hidden">
         <a-button type="primary" @click="refreshData" :loading="loading" block>
            <template #icon><RedoOutlined /></template>
            刷新数据
        </a-button>
      </a-col>
    </a-row>
  </a-spin>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, h } from 'vue'
import { Card, Row, Col, Spin, Button } from 'ant-design-vue'
import { 
  RedoOutlined, ClusterOutlined, FileTextOutlined, ProfileOutlined, 
  WifiOutlined, PlusOutlined
} from '@ant-design/icons-vue'
import type { Node, HealthStatus, Profile } from '@shared/types'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)

const stats = ref({
  nodes: 0,
  subscriptions: 0,
  profiles: 0,
  onlineNodes: 0
})

const statsItems = computed(() => [
  {
    title: '节点',
    value: `${stats.value.nodes} ( ${stats.value.onlineNodes} 在线 )`,
    icon: ClusterOutlined,
    iconBgClass: 'bg-blue-100 dark:bg-blue-900/50',
    iconColorClass: 'text-blue-500'
  },
  {
    title: '订阅',
    value: stats.value.subscriptions,
    icon: WifiOutlined,
    iconBgClass: 'bg-green-100 dark:bg-green-900/50',
    iconColorClass: 'text-green-500'
  },
  {
    title: '配置',
    value: stats.value.profiles,
    icon: FileTextOutlined,
    iconBgClass: 'bg-amber-100 dark:bg-amber-900/50',
    iconColorClass: 'text-amber-500'
  },
  {
    title: '在线率',
    value: `${stats.value.nodes > 0 ? Math.round((stats.value.onlineNodes / stats.value.nodes) * 100) : 0}%`,
    icon: ProfileOutlined,
    iconBgClass: 'bg-purple-100 dark:bg-purple-900/50',
    iconColorClass: 'text-purple-500'
  }
])

const navItems = ref([
  { title: '节点管理', path: '/nodes', icon: ClusterOutlined, iconBgClass: 'bg-blue-100 dark:bg-blue-900/50', iconColorClass: 'text-blue-500' },
  { title: '订阅管理', path: '/subscriptions', icon: WifiOutlined, iconBgClass: 'bg-green-100 dark:bg-green-900/50', iconColorClass: 'text-green-500' },
  { title: '配置管理', path: '/profiles', icon: FileTextOutlined, iconBgClass: 'bg-amber-100 dark:bg-amber-900/50', iconColorClass: 'text-amber-500' },
  { title: '添加节点', path: '/nodes/new', icon: PlusOutlined, iconBgClass: 'bg-gray-100 dark:bg-gray-700', iconColorClass: 'text-gray-500' },
  { title: '添加订阅', path: '/subscriptions/new', icon: PlusOutlined, iconBgClass: 'bg-gray-100 dark:bg-gray-700', iconColorClass: 'text-gray-500' },
  { title: '新建配置', path: '/profiles/new', icon: PlusOutlined, iconBgClass: 'bg-gray-100 dark:bg-gray-700', iconColorClass: 'text-gray-500' },
]);

const refreshData = async () => {
  loading.value = true
  try {
    const [statsRes, statusRes] = await Promise.all([
      fetch('/api/stats'),
      fetch('/api/node-statuses')
    ]);
    
    if (statsRes.ok) stats.value = await statsRes.json();
    if (statusRes.ok) {
      const statuses = await statusRes.json();
      stats.value.onlineNodes = Object.values(statuses).filter((s: any) => s.status === 'online').length;
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const goTo = (path: string) => router.push(path);
onMounted(refreshData);
</script>

<style scoped>
.statistic-card {
  transition: all 0.2s ease-in-out;
}
.statistic-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
html.dark .statistic-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
.nav-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: #fafafa;
}
html.dark .nav-card {
  background-color: #262626;
}
.nav-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
html.dark .nav-card:hover {
  background-color: #333;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.nav-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
}
</style>