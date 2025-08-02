<template>
  <a-card>
    <div class="mb-4">
      <h1 class="text-2xl font-bold">创建规则集</h1>
    </div>

    <a-form
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
        <a-button type="primary" html-type="submit" :loading="submitting">创建</a-button>
        <a-button class="ml-2" @click="goTo('/rule-sets')">取消</a-button>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { message, Form, Input, Select, Button } from 'ant-design-vue'
import { useRouter } from 'vue-router'

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

const submitting = ref(false)

const onFinish = async () => {
  submitting.value = true
  try {
    const res = await fetch('/api/rule-sets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formState)
    })

    if (res.ok) {
      message.success('创建成功')
      goTo('/rule-sets')
    } else {
      throw new Error('Failed to create rule set')
    }
  } catch (error) {
    console.error('Failed to create rule set:', error)
    message.error('创建失败')
  } finally {
    submitting.value = false
  }
}
</script>