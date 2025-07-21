<template>
  <a-card
    title="添加新节点"
    :extra="h(RouterLink, { to: '/nodes' }, () => h(Button, { icon: h(ArrowLeftOutlined) }, () => '返回列表'))"
  >
    <NodeForm />
  </a-card>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { RouterLink } from 'vue-router'
import { Card, Button } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import NodeForm from '../components/NodeForm.vue'
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>