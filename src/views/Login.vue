<template>
  <a-row justify="center" align="middle" style="min-height: 60vh">
    <a-col :xs="24" :sm="16" :md="12" :lg="8">
      <a-card>
        <div style="text-align: center; margin-bottom: 24px">
          <LoginOutlined style="font-size: 32px; color: #1677ff"/>
          <a-typography-title :level="3">登录 ProSub</a-typography-title>
        </div>
        <a-form
          name="login"
          layout="vertical"
          :model="formState"
          @finish="onFinish"
          autocomplete="off"
        >
          <a-form-item
            label="用户名"
            name="name"
            :rules="[{ required: true, message: '请输入用户名!' }]"
          >
            <a-input v-model:value="formState.name" />
          </a-form-item>

          <a-form-item
            label="密码"
            name="password"
            :rules="[{ required: true, message: '请输入密码!' }]"
          >
            <a-input-password v-model:value="formState.password" />
          </a-form-item>

          <a-form-item>
            <a-button type="primary" html-type="submit" :loading="loading" style="width: 100%">
              登录
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { LoginOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const loading = ref(false)

interface LoginFormValues {
  name?: string;
  password?: string;
}

const formState = reactive<LoginFormValues>({
  name: '',
  password: '',
})

const onFinish = async (values: LoginFormValues) => {
  loading.value = true;
  loading.value = true
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    if (res.ok) {
      message.success('登录成功')
      router.push('/dashboard')
      // router.go(0); // 强制刷新以更新布局中的用户信息，Vue Router 中不需要 router.refresh()
    } else {
      const errorData = (await res.json()) as { message: string }
      message.error(errorData.error || '登录失败')
    }
  } catch (error) {
    console.error('Login failed:', error)
    message.error('网络错误，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>