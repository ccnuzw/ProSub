<template>
  <a-row justify="center" align="middle" style="min-height: 60vh">
    <a-col :xs="24" :sm="20" :md="16" :lg="12">
      <a-spin :spinning="loading" tip="加载中...">
        <a-card>
          <div style="text-align: center; margin-bottom: 24px">
            <UserOutlined style="font-size: 32px; color: #1677ff"/>
            <a-typography-title :level="3">我的资料</a-typography-title>
          </div>
          <template v-if="user">
            <a-descriptions bordered :column="1">
              <a-descriptions-item label="用户名">{{ user.name }}</a-descriptions-item>
              <a-descriptions-item label="用户ID">{{ user.id }}</a-descriptions-item>
              <a-descriptions-item label="关联配置文件数量">{{ user.profiles.length }}</a-descriptions-item>
            </a-descriptions>
            <a-space style="margin-top: 24px; width: 100%; justify-content: flex-end">
              <a-button :icon="$slots.editOutlined ? $slots.editOutlined() : ''" @click="setIsModalVisible(true)">
                修改密码
              </a-button>
              <a-button type="primary" danger :icon="$slots.logoutOutlined ? $slots.logoutOutlined() : ''" @click="handleLogout">
                登出
              </a-button>
            </a-space>
          </template>
        </a-card>
      </a-spin>
    </a-col>
  </a-row>
  <a-modal
    title="修改密码"
    v-model:open="isModalVisible"
    @cancel="() => setIsModalVisible(false)"
    @ok="formRef?.validateFields().then(handleUpdateProfile)"
    :confirm-loading="loading"
    ok-text="确认修改"
    cancel-text="取消"
  >
    <a-form :model="formState" ref="formRef" layout="vertical">
      <a-form-item
        label="新密码 (留空则不修改)"
        name="newPassword"
      >
        <a-input-password v-model:value="formState.newPassword" />
      </a-form-item>
      <a-form-item
        label="确认新密码"
        name="confirmNewPassword"
        :dependencies="['newPassword']"
        has-feedback
        :rules="[
          {
            validator: validateConfirmNewPassword,
            trigger: 'change',
          },
        ]"
      >
        <a-input-password v-model:value="formState.confirmNewPassword" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { message, Form } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { User } from '../types'
import {
  UserOutlined,
  LogoutOutlined,
  EditOutlined,
} from '@ant-design/icons-vue'

const user = ref<User | null>(null)
const loading = ref(true)
const isModalVisible = ref(false)
const formRef = ref()
const router = useRouter()

interface PasswordFormValues {
  newPassword?: string;
  confirmNewPassword?: string;
}

const formState = reactive<PasswordFormValues>({
  newPassword: '',
  confirmNewPassword: '',
})

onMounted(() => {
  const fetchUserProfile = async () => {
    loading.value = true
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = (await res.json()) as User
        user.value = data
      } else if (res.status === 401) {
        message.warning('请先登录')
        router.push('/user/login')
      } else {
        throw new Error('获取用户信息失败')
      }
    } catch (error) {
      message.error('加载用户资料失败')
    } finally {
      loading.value = false
    }
  }
  fetchUserProfile()
})

const setIsModalVisible = (visible: boolean) => {
  isModalVisible.value = visible;
  if (!visible) {
    formState.newPassword = '';
    formState.confirmNewPassword = '';
  }
};

const handleLogout = async () => {
  try {
    const res = await fetch('/api/auth/logout', { method: 'POST' })
    if (res.ok) {
      message.success('登出成功')
      router.push('/user/login')
      // router.go(0); // Vue Router 中不需要 router.refresh()
    } else {
      throw new Error('登出失败')
    }
  } catch (error) {
    message.error('登出失败，请重试')
  }
}

const handleUpdateProfile = async () => {
  loading.value = true;
  try {
    await formRef.value.validate();
    const payload: any = {};
    if (formState.newPassword) {
      payload.newPassword = formState.newPassword;
    }

    const res = await fetch(`/api/users/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      message.success('资料更新成功！下次登录请使用新密码。');
      setIsModalVisible(false);
    } else {
      const errorData = (await res.json()) as { message?: string };
      throw new Error(errorData.message || '更新失败');
    }
  } catch (error) {
    if (error instanceof Error) message.error(error.message);
  } finally {
    loading.value = false;
  }
};

const validateConfirmNewPassword = async (_rule: any, value: string) => {
  if (formState.newPassword && value && formState.newPassword !== value) {
    return Promise.reject('两次输入的密码不一致!');
  }
  return Promise.resolve();
};
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>