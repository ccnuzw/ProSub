<template>
  <a-card title="我的资料">
    <a-descriptions bordered :column="1">
      <a-descriptions-item label="用户ID">{{ currentUser?.id }}</a-descriptions-item>
      <a-descriptions-item label="用户名">{{ currentUser?.name }}</a-descriptions-item>
      <a-descriptions-item label="默认密码已修改">{{ currentUser?.defaultPasswordChanged ? '是' : '否' }}</a-descriptions-item>
    </a-descriptions>
    <a-button type="primary" style="margin-top: 20px;" @click="router.push('/user/change-password')">
      修改密码
    </a-button>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { User } from '@shared/types';

const router = useRouter();
const currentUser = ref<User | null>(null);

onMounted(async () => {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      currentUser.value = await res.json();
    } else {
      message.error('获取用户资料失败');
      router.push('/user/login');
    }
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    message.error('获取用户资料失败');
    router.push('/user/login');
  }
});
</script>
