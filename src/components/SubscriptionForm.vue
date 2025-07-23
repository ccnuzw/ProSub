<template>
  <a-form
    :model="formState"
    layout="vertical"
    @finish="onFinish"
  >
    <a-form-item
      name="name"
      label="名称"
      :rules="[{ required: true, message: '请输入订阅名称' }]"
      class="mb-4"
    >
      <a-input v-model:value="formState.name" />
    </a-form-item>
    <a-form-item
      name="url"
      label="订阅链接 (URL)"
      :rules="[{ required: true, message: '请输入订阅链接' }, { type: 'url', message: '请输入有效的 URL' }]"
      class="mb-4"
    >
      <a-input v-model:value="formState.url" type="url" />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit" :loading="loading">
        {{ subscription ? '更新' : '创建' }}
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { Subscription } from '../types'

const props = defineProps<{ subscription?: Subscription }>()

const router = useRouter()
const loading = ref(false)

const formState = reactive<Subscription>({
  id: '',
  name: '',
  url: '',
})

onMounted(() => {
  if (props.subscription) {
    Object.assign(formState, props.subscription)
  }
})

watch(() => props.subscription, (newSubscription) => {
  if (newSubscription) {
    Object.assign(formState, newSubscription)
  }
})

const onFinish = async (values: Subscription) => {
  loading.value = true
  const method = props.subscription ? 'PUT' : 'POST'
  const url = props.subscription ? `/api/subscriptions/${props.subscription.id}` : '/api/subscriptions'

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    if (res.ok) {
      message.success(props.subscription ? '订阅更新成功' : '订阅创建成功')
      router.push('/subscriptions')
    } else {
      const errorData = (await res.json()) as { message: string }
      message.error(errorData.message || '操作失败')
    }
  } catch (error) {
    console.error('Subscription operation failed:', error)
    message.error('操作失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>