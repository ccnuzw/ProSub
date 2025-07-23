<template>
  <a-row type="flex" justify="center" align="middle" style="min-height: 100vh;">
    <a-col :span="8">
      <a-card title="修改密码">
        <a-form
          :model="formState"
          @finish="onFinish"
          layout="vertical"
        >
          <a-form-item
            label="旧密码"
            name="oldPassword"
            :rules="[{ required: true, message: '请输入旧密码' }]"
            v-if="currentUser && currentUser.defaultPasswordChanged"
          >
            <a-input-password v-model:value="formState.oldPassword" />
          </a-form-item>

          <a-form-item
            label="新密码"
            name="newPassword"
            :rules="[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少需要6个字符' },
            ]"
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

          <a-form-item>
            <a-button type="primary" html-type="submit" :loading="loading" block>
              修改密码
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { User } from '@shared/types';

const router = useRouter();
const loading = ref(false);

// This would typically come from a global state or prop if user data is fetched elsewhere
const currentUser = ref<User | null>(null); // Placeholder for current user data

// Fetch current user to determine if old password is required
const fetchCurrentUser = async () => {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      currentUser.value = await res.json();
    } else {
      currentUser.value = null;
    }
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    currentUser.value = null;
  }
};

fetchCurrentUser();

const formState = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const validateConfirmPassword = (_rule: any, value: string) => {
  if (value === '') {
    return Promise.reject('请确认新密码');
  } else if (value !== formState.newPassword) {
    return Promise.reject('两次输入的密码不一致');
  } else {
    return Promise.resolve();
  }
};

const onFinish = async (values: typeof formState) => {
  loading.value = true;
  try {
    const res = await fetch('/api/users/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oldPassword: currentUser.value?.defaultPasswordChanged ? values.oldPassword : undefined,
        newPassword: values.newPassword,
      }),
    });
    if (res.ok) {
      message.success('密码修改成功');
      router.push('/dashboard'); // Redirect to dashboard after password change
    } else {
      const errorData = await res.json();
      throw new Error(errorData.message || '密码修改失败');
    }
  } catch (error) {
    if (error instanceof Error) message.error(error.message);
  } finally {
    loading.value = false;
  }
};
</script>
