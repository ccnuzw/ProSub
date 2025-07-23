<template>
  <a-card
    title="编辑配置文件"
    :extra="h(RouterLink, { to: '/profiles' }, () => h(Button, { icon: h(ArrowLeftOutlined) }, () => '返回列表'))"
  >
    <a-spin :spinning="loading">
      <ProfileForm v-if="profile" :profile="profile" />
      <p v-else-if="!loading">加载失败或配置文件不存在。</p>
    </a-spin>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { Profile } from '@shared/types'
import { message, Spin, Card, Button } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import ProfileForm from '../components/ProfileForm.vue'

const route = useRoute()
const profile = ref<Profile | null>(null)
const loading = ref(true)
const { id } = route.params

onMounted(() => {
  if (id) {
    const fetchProfile = async () => {
      loading.value = true
      try {
        const res = await fetch(`/api/profiles/${id}`)
        if (res.ok) {
          const data = (await res.json()) as Profile
          profile.value = data
        } else {
          throw new Error('配置文件不存在')
        }
      } catch (error) {
        message.error('加载配置文件数据失败')
      } finally {
        loading.value = false
      }
    }
    fetchProfile()
  }
})
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>