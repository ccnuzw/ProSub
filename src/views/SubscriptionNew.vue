<template>
  <a-card
    title="添加新订阅"
    :extra="h(RouterLink, { to: '/subscriptions' }, () => h(Button, { icon: h(ArrowLeftOutlined) }, () => '返回列表'))"
    class="w-full"
  >
    <SubscriptionForm />
  </a-card>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { RouterLink } from 'vue-router'
import { Card, Button } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import SubscriptionForm from '../components/SubscriptionForm.vue'
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>