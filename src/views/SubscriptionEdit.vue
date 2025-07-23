<template>
  <a-card
    title="编辑订阅"
    :extra="h(RouterLink, { to: '/subscriptions' }, () => h(Button, { icon: h(ArrowLeftOutlined) }, () => '返回列表'))"
    class="w-full"
  >
    <a-spin :spinning="loading">
      <SubscriptionForm v-if="subscription" :subscription="subscription" />
      <p v-else-if="!loading">加载失败或订阅不存在。</p>
    </a-spin>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { Subscription } from '../types'
import { message, Spin, Card, Button } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import SubscriptionForm from '../components/SubscriptionForm.vue'

const route = useRoute()
const subscription = ref<Subscription | null>(null)
const loading = ref(true)
const { id } = route.params

onMounted(() => {
  if (id) {
    const fetchSubscription = async () => {
      loading.value = true
      try {
        const res = await fetch(`/api/subscriptions/${id}`)
        if (res.ok) {
          const data = (await res.json()) as Subscription
          subscription.value = data
        } else {
          throw new Error('订阅不存在')
        }
      } catch (error) {
        message.error('加载订阅数据失败')
      } finally {
        loading.value = false
      }
    }
    fetchSubscription()
  }
})
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>