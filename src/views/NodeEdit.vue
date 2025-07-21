<template>
  <a-card
    title="编辑节点"
    :extra="h(RouterLink, { to: '/nodes' }, () => h(Button, { icon: h(ArrowLeftOutlined) }, () => '返回列表'))"
  >
    <a-spin :spinning="loading">
      <NodeForm v-if="node" :node="node" />
      <p v-else-if="!loading">节点数据加载失败或不存在。</p>
    </a-spin>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { Node } from '../types'
import { message, Spin, Card, Button } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import NodeForm from '../components/NodeForm.vue'

const route = useRoute()
const node = ref<Node | null>(null)
const loading = ref(true)
const { id } = route.params

onMounted(() => {
  if (id) {
    const fetchNode = async () => {
      loading.value = true
      try {
        const res = await fetch(`/api/nodes/${id}`)
        if (res.ok) {
          const data = (await res.json()) as Node
          node.value = data
        } else {
          throw new Error('节点不存在')
        }
      } catch (error) {
        message.error('加载节点数据失败')
      } finally {
        loading.value = false
      }
    }
    fetchNode()
  }
})
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>