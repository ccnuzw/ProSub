<template>
  <a-spin :spinning="loading" size="large" tip="加载中...">
    <div style="padding: 1px">
      <a-typography-title :level="2" style="margin-bottom: 24px">仪表盘</a-typography-title>
      <a-row :gutter="[24, 24]">
        <a-col :xs="24" :sm="12" :md="6">
          <a-card :bordered="false">
            <a-statistic
              title="节点总数"
              :value="nodeCount"
              :prefix="h(ClusterOutlined)"
              :value-style="{ color: '#3f8600' }"
            />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <a-card :bordered="false">
            <a-statistic
              title="在线节点"
              :value="onlineNodeCount"
              :prefix="h(CheckCircleOutlined)"
              :value-style="{ color: '#52c41a' }"
            />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <a-card :bordered="false">
            <a-statistic
              title="离线节点"
              :value="offlineNodeCount"
              :prefix="h(CloseCircleOutlined)"
              :value-style="{ color: '#eb2f96' }"
            />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <a-card :bordered="false">
            <a-statistic
              title="订阅总数"
              :value="subscriptionCount"
              :prefix="h(WifiOutlined)"
              :value-style="{ color: '#1890ff' }"
            />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <a-card :bordered="false">
            <a-statistic
              title="配置文件总数"
              :value="profileCount"
              :prefix="h(FileTextOutlined)"
              :value-style="{ color: '#faad14' }"
            />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <a-card :bordered="false">
            <a-statistic
              title="累计订阅请求"
              :value="totalTrafficCount"
              :prefix="h(LineChartOutlined)"
              :value-style="{ color: '#722ed1' }"
            />
          </a-card>
        </a-col>

        <a-col :xs="24" :lg="12">
          <a-card
            :bordered="false"
          >
            <template #title>
              <a-space>
                <BarChartOutlined /> 订阅请求趋势
              </a-space>
            </template>
            <template #extra>
              <a-space>
                <a-select
                  v-model:value="trafficGranularity"
                  style="width: 120px"
                  @change="(value: 'day' | 'week' | 'month') => trafficGranularity = value"
                >
                  <a-select-option value="day">按天</a-select-option>
                  <a-select-option value="week">按周</a-select-option>
                  <a-select-option value="month">按月</a-select-option>
                </a-select>
                <a-select
                  allow-clear
                  placeholder="按配置过滤"
                  style="width: 150px"
                  v-model:value="selectedProfileForTrend"
                >
                  <a-select-option v-for="profile in profiles" :key="profile.id" :value="profile.id">
                    {{ profile.name }}
                  </a-select-option>
                </a-select>
              </a-space>
            </template>
            <a-table
              size="small"
              :columns="trendColumns"
              :data-source="trafficTrend"
              :pagination="{ pageSize: 5 }"
              row-key="date"
            />
          </a-card>
        </a-col>

        <a-col :xs="24" :lg="12">
          <a-card
            :bordered="false"
          >
            <template #title>
              <a-space>
                <TableOutlined /> 各配置文件请求统计
              </a-space>
            </template>
            <a-table
              size="small"
              :columns="profileTrafficColumns"
              :data-source="profileTrafficData"
              :pagination="{ pageSize: 5 }"
              row-key="key"
            />
          </a-card>
        </a-col>
      </a-row>
    </div>
  </a-spin>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, h } from 'vue'
import { message } from 'ant-design-vue'
import {
  ClusterOutlined,
  FileTextOutlined,
  WifiOutlined,
  LineChartOutlined,
  BarChartOutlined,
  TableOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons-vue'
import type { TableProps } from 'ant-design-vue'
import { Node, Subscription, Profile, ProfileTrafficData, HealthStatus } from '@shared/types'

const nodeCount = ref<number>(0)
const subscriptionCount = ref<number>(0)
const profileCount = ref<number>(0)
const totalTrafficCount = ref<number>(0)
const onlineNodeCount = ref<number>(0)
const offlineNodeCount = ref<number>(0)
const profileTraffic = ref<Record<string, number>>({})
const trafficTrend = ref<{ date: string; count: number }[]>([])
const loading = ref(true)
const profiles = ref<Profile[]>([])
const trafficGranularity = ref<'day' | 'week' | 'month'>('day')
const selectedProfileForTrend = ref<string | undefined>(undefined)

const fetchData = async () => {
  loading.value = true
  try {
    const [nodesRes, subsRes, profilesRes, nodeStatusesRes] = await Promise.all([
      fetch('/api/nodes'),
      fetch('/api/subscriptions'),
      fetch('/api/profiles'),
      fetch('/api/node-statuses'),
    ])

    if (!nodesRes.ok || !subsRes.ok || !profilesRes.ok || !nodeStatusesRes.ok) {
      throw new Error('Failed to fetch initial dashboard data')
    }

    const nodes: Node[] = await nodesRes.json()
    const subscriptions: Subscription[] = await subsRes.json()
    const profilesData: Profile[] = await profilesRes.json()
    const nodeStatuses: Record<string, HealthStatus> = await nodeStatusesRes.json()

    nodeCount.value = nodes.length
    subscriptionCount.value = subscriptions.length
    profileCount.value = profilesData.length
    profiles.value = profilesData

    onlineNodeCount.value = nodes.filter(node => nodeStatuses[node.id]?.status === 'online').length;
    offlineNodeCount.value = nodes.filter(node => nodeStatuses[node.id]?.status === 'offline').length;

    const trendUrl = `/api/traffic?granularity=${trafficGranularity.value}${selectedProfileForTrend.value ? `&profileId=${selectedProfileForTrend.value}` : ''}`
    const trendRes = await fetch(trendUrl)
    if (!trendRes.ok) throw new Error('Failed to fetch traffic trend data')
    const trafficTrendData: { date: string; count: number; profileId?: string }[] = await trendRes.json()
    trafficTrend.value = trafficTrendData

    let recentTrafficCount = 0
    const trafficByProfile: Record<string, number> = {}

    // Aggregate total traffic and traffic by profile from the trend data
    trafficTrendData.forEach((record) => {
      recentTrafficCount += record.count
      if (record.profileId) {
        trafficByProfile[record.profileId] = (trafficByProfile[record.profileId] || 0) + record.count
      }
    })

    totalTrafficCount.value = recentTrafficCount
    profileTraffic.value = trafficByProfile
  } catch (error) {
    message.error('加载仪表盘数据失败')
    console.error('Failed to fetch dashboard data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

watch([trafficGranularity, selectedProfileForTrend], () => {
  fetchData()
})

const profileTrafficData = computed(() => {
  return Object.keys(profileTraffic.value)
    .map((profileId) => {
      const profile = profiles.value.find((p) => p.id === profileId)
      return {
        key: profileId,
        name: profile ? profile.name : `未知配置文件 (${profileId})`,
        count: profileTraffic.value[profileId],
      }
    })
    .sort((a, b) => b.count - a.count)
})

const profileTrafficColumns: TableProps<ProfileTrafficData>['columns'] = [
  { title: '配置文件名称', dataIndex: 'name', key: 'name' },
  { title: '总请求次数', dataIndex: 'count', key: 'count', sorter: (a, b) => a.count - b.count },
]

const trendColumns: TableProps<{ date: string; count: number }>['columns'] = [
  { title: '日期', dataIndex: 'date', key: 'date' },
  { title: '请求次数', dataIndex: 'count', key: 'count', sorter: (a, b) => a.count - b.count },
]
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>