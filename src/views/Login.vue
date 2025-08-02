<template>
  <div class="login-container">
    <a-card class="login-card">
      <h1 class="text-2xl font-bold mb-4 text-center">登录</h1>
      <a-form :model="formState" @finish="onFinish" layout="vertical">
        <a-form-item
          label="用户名"
          name="name"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <a-input v-model:value="formState.name" size="large" />
        </a-form-item>

        <a-form-item
          label="密码"
          name="password"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <a-input-password v-model:value="formState.password" size="large" />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="loading" block size="large">
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);

const formState = reactive({
  name: '',
  password: '',
});

const onFinish = async (values: typeof formState) => {
  loading.value = true;
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      message.success('登录成功');
      router.push('/dashboard');
    } else {
      const errorData = await res.json();
      throw new Error(errorData.message || '登录失败');
    }
  } catch (error) {
    if (error instanceof Error) message.error(error.message);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 16px;
  background-color: #f0f2f5;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .login-container {
    padding: 12px;
  }
  
  .login-card {
    max-width: 100%;
  }
  
  :deep(.ant-card-head) {
    padding: 0 16px;
  }
  
  :deep(.ant-card-body) {
    padding: 24px;
  }
}
</style>