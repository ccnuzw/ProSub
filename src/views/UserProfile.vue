<template>
  <div class="user-profile">
    <div class="profile-header">
      <h1 class="page-title">用户资料</h1>
      <p class="page-subtitle">管理您的账户信息和密码</p>
    </div>

    <div class="profile-content">
      <a-card class="profile-card">
        <template #title>
          <div class="card-title">
            <UserOutlined class="title-icon" />
            <span>基本信息</span>
          </div>
        </template>
        
        <a-form :model="userInfo" layout="vertical">
          <a-form-item label="用户名">
            <a-input v-model:value="userInfo.name" disabled />
          </a-form-item>
          
          <a-form-item label="用户ID">
            <a-input v-model:value="userInfo.id" disabled />
          </a-form-item>
          
          <a-form-item label="账户状态">
            <a-tag :color="userInfo.defaultPasswordChanged ? 'green' : 'orange'">
              {{ userInfo.defaultPasswordChanged ? '已设置密码' : '使用默认密码' }}
            </a-tag>
          </a-form-item>
        </a-form>
      </a-card>

      <a-card class="profile-card">
        <template #title>
          <div class="card-title">
            <LockOutlined class="title-icon" />
            <span>修改密码</span>
          </div>
        </template>
        
        <a-form :model="passwordForm" :rules="passwordRules" layout="vertical" @finish="handleChangePassword">
          <a-form-item label="当前密码" name="currentPassword">
            <a-input-password v-model:value="passwordForm.currentPassword" placeholder="请输入当前密码" />
          </a-form-item>
          
          <a-form-item label="新密码" name="newPassword">
            <a-input-password v-model:value="passwordForm.newPassword" placeholder="请输入新密码" />
          </a-form-item>
          
          <a-form-item label="确认新密码" name="confirmPassword">
            <a-input-password v-model:value="passwordForm.confirmPassword" placeholder="请再次输入新密码" />
          </a-form-item>
          
          <a-form-item>
            <a-button type="primary" html-type="submit" :loading="changingPassword">
              修改密码
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'

interface UserInfo {
  id: string
  name: string
  defaultPasswordChanged: boolean
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const userInfo = ref<UserInfo>({
  id: '',
  name: '',
  defaultPasswordChanged: false
})

const passwordForm = ref<PasswordForm>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const changingPassword = ref(false)

const passwordRules = {
  currentPassword: [{ required: true, message: '请输入当前密码' }],
  newPassword: [
    { required: true, message: '请输入新密码' },
    { min: 6, message: '密码长度至少6位' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码' },
    {
      validator: (rule: any, value: string) => {
        if (value && value !== passwordForm.value.newPassword) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      }
    }
  ]
}

const fetchUserInfo = async () => {
  try {
    const response = await fetch('/api/auth/me')
    if (response.ok) {
      userInfo.value = await response.json()
    } else {
      message.error('获取用户信息失败')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    message.error('获取用户信息失败')
  }
}

const handleChangePassword = async () => {
  changingPassword.value = true
  
  try {
    const response = await fetch('/api/users/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword
      })
    })

    if (response.ok) {
      message.success('密码修改成功')
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      // 重新获取用户信息
      await fetchUserInfo()
    } else {
      const error = await response.json()
      message.error(error.message || '密码修改失败')
    }
  } catch (error) {
    console.error('密码修改失败:', error)
    message.error('密码修改失败')
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.user-profile {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 16px;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-card {
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

.title-icon {
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .user-profile {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
}
</style>
