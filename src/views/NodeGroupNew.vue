<template>
  <a-card>
    <div class="mb-4">
      <h1 class="text-2xl font-bold">创建节点分组</h1>
    </div>

    <a-form
      :model="formState"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 14 }"
      layout="horizontal"
      @finish="onFinish"
    >
      <a-form-item
        label="分组名称"
        name="name"
        :rules="[{ required: true, message: '请输入分组名称' }]"
      >
        <a-input v-model:value="formState.name" />
      </a-form-item>

      <a-form-item label="选择节点" name="nodeIds">
        <a-select
          v-model:value="formState.nodeIds"
          mode="multiple"
          placeholder="请选择节点"
          :options="nodeOptions"
          :loading="nodesLoading"
        />
      </a-form-item>

      <a-form-item :wrapper-col="{ offset: 4, span: 14 }">
        <a-button type="primary" html-type="submit" :loading="submitting">创建</a-button>
        <a-button class="ml-2" @click="goTo('/node-groups')">取消</a-button>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, Form, Input, Select, Button } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { Node } from '@shared/types'

const router = useRouter()
const goTo = (path: string) => router.push(path)

interface FormState {
  name: string
  nodeIds: string[]
}

const formState = reactive<FormState>({
  name: '',
  nodeIds: []
})

const nodes = ref<Node[]>([])
const nodesLoading = ref(true)
const submitting = ref(false)

const nodeOptions = ref<Array<{ label: string; value: string }>>([])

const fetchNodes = async () => {
  nodesLoading.value = true
  try {
    const res = await fetch('/api/nodes')
    if (res.ok) {
      nodes.value = await res.json()
      nodeOptions.value = nodes.value.map(node => ({
        label: node.name,
        value: node.id
      }))
    } else {
      throw new Error('Failed to fetch nodes')
    }
  } catch (error) {
    console.error('Failed to fetch nodes:', error)
    message.error('获取节点失败')
  } finally {
    nodesLoading.value = false
  }
}

const onFinish = async () => {
  submitting.value = true
  try {
    const res = await fetch('/api/node-groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: formState.name,
        nodeIds: formState.nodeIds
      })
    })

    if (res.ok) {
      message.success('创建成功')
      goTo('/node-groups')
    } else {
      throw new Error('Failed to create node group')
    }
  } catch (error) {
    console.error('Failed to create node group:', error)
    message.error('创建失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchNodes()
})
</script>