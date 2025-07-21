<template>
  <a-card
    title="编辑用户"
    :extra="h(RouterLink, { to: '/user' }, () => h(Button, { icon: h(ArrowLeftOutlined) }, () => '返回列表'))"
  >
    <a-spin :spinning="loading">
      <UserForm v-if="user" :user="user" />
      <p v-else-if="!loading">用户数据加载失败或不存在。</p>
    </a-spin>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { User } from '../types'
import { message, Spin, Card, Button } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import UserForm from '../components/UserForm.vue'

const route = useRoute()
const user = ref<User | null>(null)
const loading = ref(true)
const { id } = route.params

onMounted(() => {
  if (id) {
    const fetchUser = async () => {
      loading.value = true
      try {
        const res = await fetch(`/api/users/${id}`)
        if (res.ok) {
          const data = (await res.json()) as User
          user.value = data
        } else {
          throw new Error('用户不存在')
        }
      } catch (error) {
        message.error('加载用户数据失败')
      } finally {
        loading.value = false
      }
    }
    fetchUser()
  }
})
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>