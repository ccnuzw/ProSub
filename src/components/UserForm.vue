<template>
  <a-form
    :model="formState"
    layout="vertical"
    @finish="onFinish"
  >
    <a-form-item
      name="name"
      label="用户名"
      :rules="[{ required: true, message: '请输入用户名' }]"
    >
      <a-input v-model:value="formState.name" />
    </a-form-item>
    <a-form-item
      name="password"
      label="密码"
      :rules="user ? [] : [{ required: true, message: '请输入密码' }]"
    >
      <a-input-password v-model:value="formState.password" :placeholder="user ? '留空则不修改密码' : '请输入密码'" />
    </a-form-item>
    <a-form-item
      name="confirmPassword"
      label="确认密码"
      :dependencies="['password']"
      has-feedback
      :rules="[
        {
          validator: validateConfirmPassword,
          trigger: 'change',
        },
      ]"
    >
      <a-input-password v-model:value="formState.confirmPassword" />
    </a-form-item>
    <a-form-item
      name="profiles"
      label="关联配置文件"
    >
      <a-select v-model:value="formState.profiles" mode="multiple" placeholder="请选择关联的配置文件">
        <a-select-option v-for="profile in allProfiles" :key="profile.id" :value="profile.id">
          {{ profile.name }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit" :loading="loading">
        {{ user ? '更新' : '创建' }}
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { User, Profile } from '../types'

const props = defineProps<{ user?: User }>()

const router = useRouter()
const loading = ref(false)
const dataLoading = ref(true)
const allProfiles = ref<Profile[]>([])

interface UserFormValues {
  name?: string;
  password?: string;
  confirmPassword?: string;
  profiles?: string[];
}

const formState = reactive<UserFormValues>({
  name: '',
  password: '',
  confirmPassword: '',
  profiles: [],
})

const fetchData = async () => {
  dataLoading.value = true
  try {
    const profilesRes = await fetch('/api/profiles')
    allProfiles.value = (await profilesRes.json()) as Profile[]
  } catch (error) {
    console.error('Failed to fetch profile data:', error)
    message.error('加载配置文件数据失败')
  } finally {
    dataLoading.value = false
  }
}

onMounted(() => {
  fetchData()
  if (props.user) {
    Object.assign(formState, props.user)
  }
})

watch(() => props.user, (newUser) => {
  if (newUser) {
    Object.assign(formState, newUser)
  }
})

const validateConfirmPassword = async (_rule: any, value: string) => {
  if (formState.password && value && formState.password !== value) {
    return Promise.reject('两次输入的密码不一致!')
  }
  return Promise.resolve()
}

const onFinish = async (values: UserFormValues) => {
  loading.value = true
  const method = props.user ? 'PUT' : 'POST'
  const url = props.user ? `/api/users/${props.user.id}` : '/api/users'

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    if (res.ok) {
      message.success(props.user ? '用户更新成功' : '用户创建成功')
      router.push('/user')
    } else {
      const errorData = (await res.json()) as { message: string }
      message.error(errorData.message || '操作失败')
    }
  } catch (error) {
    console.error('User operation failed:', error)
    message.error('操作失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>