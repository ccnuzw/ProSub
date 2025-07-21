<template>
  <a-card
    title="添加新用户"
    :extra="h(RouterLink, { to: '/user' }, () => h(Button, { icon: h(ArrowLeftOutlined) }, () => '返回列表'))"
  >
    <UserForm />
  </a-card>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { RouterLink } from 'vue-router'
import { Card, Button } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import UserForm from '../components/UserForm.vue'
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>