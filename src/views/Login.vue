<template>
  <a-row type="flex" justify="center" align="middle" style="min-height: 100vh;">
    <a-col :span="8">
      <a-card title="登录">
        <a-form
          :model="formState"
          @finish="onFinish"
          layout="vertical"
        >
          <a-form-item
            label="用户名"
            name="name"
            :rules="[{ required: true, message: '请输入用户名' }]"
          >
            <a-input v-model:value="formState.name" />
          </a-form-item>

          <a-form-item
            label="密码"
            name="password"
            :rules="[{ required: true, message: '请输入密码' }]"
          >
            <a-input-password v-model:value="formState.password" />
          </a-form-item>

          <a-form-item>
            <a-button type="primary" html-type="submit" :loading="loading" block>
              登录
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </a-col>
  </a-row>
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
