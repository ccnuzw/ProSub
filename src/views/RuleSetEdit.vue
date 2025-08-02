<template>
  <a-card>
    <div class="mb-4">
      <h1 class="text-2xl font-bold">编辑规则集</h1>
    </div>

    <a-form
      v-if="!loading"
      :model="formState"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 14 }"
      layout="horizontal"
      @finish="onFinish"
    >
      <a-form-item
        label="规则集名称"
        name="name"
        :rules="[{ required: true, message: '请输入规则集名称' }]"
      >
        <a-input v-model:value="formState.name" />
      </a-form-item>

      <a-form-item label="描述" name="description">
        <a-textarea v-model:value="formState.description" :rows="2" />
      </a-form-item>

      <a-form-item
        label="客户端类型"
        name="clientType"
        :rules="[{ required: true, message: '请选择客户端类型' }]"
      >
        <a-select v-model:value="formState.clientType" placeholder="请选择客户端类型">
          <a-select-option value="clash">Clash</a-select-option>
          <a-select-option value="surge">Surge</a-select-option>
          <a-select-option value="quantumultx">Quantumult X</a-select-option>
          <a-select-option value="loon">Loon</a-select-option>
          <a-select-option value="sing-box">Sing-Box</a-select-option>
          <a-select-option value="general">通用</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item
        label="规则内容"
        name="content"
        :rules="[{ required: true, message: '请输入规则内容' }]"
      >
        <a-textarea v-model:value="formState.content" :rows="10" placeholder="请输入规则内容" />
      </a-form-item>

      <a-form-item :wrapper-col="{ offset: 4, span: 14 }">
        <a-button type="primary" html-type="submit" :loading="submitting">保存</a-button>
        <a-button class="ml-2" @click="goTo('/rule-sets')">取消</a-button>
      </a-form-item>
    </a-form>

    <a-spin v-else />
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, Form, Input, Select, Button, Spin } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { CustomRuleSet } from '@shared/types'

const route = useRoute()
const router = useRouter()
const goTo = (path: string) => router.push(path)

interface FormState {
  name: string
  description: string
  clientType: string
  content: string
}

const formState = reactive<FormState>({
  name: '',
  description: '',
  clientType: 'clash',
  content: ''
})

const loading = ref(true)
const submitting = ref(false)

const fetchRuleSet = async () => {
  loading.value = true
  try {
    const res = await fetch(`/api/rule-sets/${route.params.id}`)
    if (res.ok) {
      const ruleSet: CustomRuleSet = await res.json()
      formState.name = ruleSet.name
      formState.description = ruleSet.description
      formState.clientType = ruleSet.clientType
      formState.content = ruleSet.content
    } else {
      throw new Error('Failed to fetch rule set')
    }
  } catch (error) {
    console.error('Failed to fetch rule set:', error)
    message.error('获取规则集失败')
  } finally {
    loading.value = false
  }
}

const onFinish = async () => {
  submitting.value = true
  try {
    const res = await fetch(`/api/rule-sets/${route.params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formState)
    })

    if (res.ok) {
      message.success('保存成功')
      goTo('/rule-sets')
    } else {
      throw new Error('Failed to update rule set')
    }
  } catch (error) {
    console.error('Failed to update rule set:', error)
    message.error('保存失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchRuleSet()
})
</script>