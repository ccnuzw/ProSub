<template>
  <a-card class="mobile-card">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-xl font-bold">节点管理</h1>
      <div class="flex gap-2">
        <a-button type="primary" size="small" @click="navigateTo('/nodes/new')">
          <PlusOutlined />
        </a-button>
      </div>
    </div>

    <div v-if="!loading && nodes.length > 0" class="mb-4">
      <a-input-search
        placeholder="搜索节点..."
        @update:value="searchTerm = $event"
        allow-clear
        size="small"
      />
    </div>

    <div v-if="!loading && nodes.length > 0" class="mobile-list">
      <div 
        v-for="node in filteredNodes" 
        :key="node.id" 
        class="mobile-list-item mobile-swipe-delete"
        @touchstart="onTouchStart($event, node.id)"
        @touchmove="onTouchMove($event, node.id)"
        @touchend="onTouchEnd(node.id)"
      >
        <div class="swipe-content" :ref="(el: any) => setContentRef(el, node.id)">
          <div class="font-medium">{{ node.name }}</div>
          <div class="text-sm text-gray-500">{{ node.server }}:{{ node.port }}</div>
          <div class="flex items-center mt-1">
            <a-tag :color="getNodeTypeColor(node.type)" class="text-xs mr-2">{{ node.type }}</a-tag>
            <a-tag v-if="nodeStatus[node.id]?.status === 'online'" :color="getNodeStatusColor(node)" class="text-xs">
              {{ nodeStatus[node.id]?.latency ? `${nodeStatus[node.id].latency}ms` : '在线' }}
            </a-tag>
            <a-tag v-else-if="nodeStatus[node.id]?.status === 'offline'" color="error" class="text-xs">离线</a-tag>
            <a-tag v-else color="default" class="text-xs">未知</a-tag>
          </div>
        </div>
        <div class="swipe-actions">
          <button class="delete-btn" @click="handleDelete(node.id)">删除</button>
        </div>
      </div>
    </div>

    <a-empty v-else-if="!loading && nodes.length === 0" description="暂无节点">
      <a-button type="primary" @click="navigateTo('/nodes/new')">添加节点</a-button>
    </a-empty>

    <a-spin v-else />
  </a-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message, Tag, Spin, Empty, Card } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import type { Node, HealthStatus } from '@shared/types'
import { useRouter } from 'vue-router'

const router = useRouter()
const navigateTo = (path: string) => {
  router.push(path)
}

const nodes = ref<Node[]>([])
const loading = ref(true)
const searchTerm = ref('')
const nodeStatus = ref<Record<string, HealthStatus>>({})

// 移动端滑动删除相关状态
const touchStartX = ref(0)
const touchStartY = ref(0)
const contentRefs = ref<Record<string, any>>({})

const filteredNodes = computed(() => {
  if (!searchTerm.value) return nodes.value
  const term = searchTerm.value.toLowerCase()
  return nodes.value.filter((node: Node) => 
    node.name.toLowerCase().includes(term) ||
    node.server.toLowerCase().includes(term) ||
    node.type.toLowerCase().includes(term)
  )
})

const getNodeTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    vmess: 'blue',
    vless: 'green',
    ss: 'orange',
    trojan: 'red',
    ssr: 'purple',
    hysteria: 'cyan',
    tuic: 'pink'
  }
  return colorMap[type] || 'default'
}

const getNodeStatusColor = (node: Node) => {
  const status = nodeStatus.value[node.id]
  if (!status || !status.latency) return 'success'
  if (status.latency < 500) return 'success'
  if (status.latency < 1000) return 'warning'
  return 'error'
}

const setContentRef = (el: any, nodeId: string) => {
  if (el) {
    contentRefs.value[nodeId] = el
  }
}

const onTouchStart = (e: TouchEvent, nodeId: string) => {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
}

const onTouchMove = (e: TouchEvent, nodeId: string) => {
  if (!contentRefs.value[nodeId]) return

  const touchX = e.touches[0].clientX
  const touchY = e.touches[0].clientY
  const diffX = touchStartX.value - touchX
  const diffY = Math.abs(touchStartY.value - touchY)

  // 只有在主要是水平滑动时才触发滑动删除
  if (diffY < diffX && diffX > 10) {
    e.preventDefault()
    contentRefs.value[nodeId]!.style.transform = `translateX(-${Math.min(diffX, 80)}px)`
  }
}

const onTouchEnd = (nodeId: string) => {
  if (!contentRefs.value[nodeId]) return

  const transform = contentRefs.value[nodeId]!.style.transform
  if (transform && transform.includes('-')) {
    const translateX = parseInt(transform.match(/-([\d.]+)px/)?.[1] || '0')
    if (translateX > 40) {
      // 展开删除按钮
      contentRefs.value[nodeId]!.style.transform = 'translateX(-80px)'
    } else {
      // 收起删除按钮
      contentRefs.value[nodeId]!.style.transform = 'translateX(0)'
    }
  }
}

const fetchNodes = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/nodes')
    if (res.ok) {
      nodes.value = await res.json()
    } else {
      throw new Error('Failed to fetch nodes')
    }
  } catch (error) {
    console.error('Failed to fetch nodes:', error)
    message.error('获取节点失败')
  } finally {
    loading.value = false
  }
}

const fetchNodeStatus = async () => {
  try {
    const res = await fetch('/api/node-statuses')
    if (res.ok) {
      nodeStatus.value = await res.json()
    }
  } catch (error) {
    console.error('Failed to fetch node status:', error)
  }
}

const handleDelete = async (id: string) => {
  try {
    const res = await fetch(`/api/nodes/${id}`, { method: 'DELETE' })
    if (res.ok) {
      message.success('删除成功')
      nodes.value = nodes.value.filter((node: Node) => node.id !== id)
    } else {
      throw new Error('Failed to delete node')
    }
  } catch (error) {
    console.error('Failed to delete node:', error)
    message.error('删除失败')
  }
}

onMounted(() => {
  fetchNodes()
  fetchNodeStatus()
})
</script>

<style scoped>
.mobile-swipe-delete {
  position: relative;
  overflow: hidden;
}

.mobile-swipe-delete .swipe-content {
  transition: transform 0.3s ease;
  background: white;
  position: relative;
  z-index: 2;
}

.mobile-swipe-delete .swipe-actions {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  display: flex;
}

.mobile-swipe-delete .swipe-actions button {
  height: 100%;
  border: none;
  color: white;
  padding: 0 20px;
}

.mobile-swipe-delete .delete-btn {
  background: #ff4d4f;
}

.dark .mobile-swipe-delete .swipe-content {
  background: #1f1f1f;
}
</style>