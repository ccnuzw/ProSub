<template>
  <a-card title="修改密码">
    <a-form
      :model="formState"
      name="changePassword"
      @finish="onFinish"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 14 }"
    >
      <a-form-item
        label="旧密码"
        name="oldPassword"
        :rules="[{ required: true, message: '请输入旧密码' }]"
      >
        <a-input-password v-model:value="formState.oldPassword" />
      </a-form-item>

      <a-form-item
        label="新密码"
        name="newPassword"
        :rules="[{ required: true, message: '请输入新密码' }]"
      >
        <a-input-password v-model:value="formState.newPassword" />
      </a-form-item>

      <a-form-item
        label="确认新密码"
        name="confirmPassword"
        :rules="[
          { required: true, message: '请确认新密码' },
          { validator: validateConfirmPassword, trigger: 'blur' },
        ]"
      >
        <a-input-password v-model:value="formState.confirmPassword" />
      </a-form-item>

      <a-form-item :wrapper-col="{ offset: 6, span: 14 }">
        <a-button type="primary" html-type="submit" :loading="loading">
          修改密码
        </a-button>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)

interface ChangePasswordForm {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const formState = reactive<ChangePasswordForm>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const validateConfirmPassword = async (_rule: any, value: string) => {
  if (value === '') {
    return Promise.reject('请确认新密码')
  }
  if (value !== formState.newPassword) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

const onFinish = async (values: ChangePasswordForm) => {
  loading.value = true
  try {
    const res = await fetch('/api/users/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      }),
    })

    if (res.ok) {
      message.success('密码修改成功，请重新登录')
      router.push('/user/login')
    } else {
      const errorData = (await res.json()) as { message: string }
      message.error(errorData.message || '修改密码失败')
    }
  } catch (error) {
    console.error('Change password failed:', error)
    message.error('网络错误，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>