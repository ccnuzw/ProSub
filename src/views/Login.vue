<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 背景装饰 -->
      <div class="background-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
        <div class="decoration-line line-1"></div>
        <div class="decoration-line line-2"></div>
      </div>

      <!-- 登录卡片 -->
      <div class="login-card">
        <div class="login-header">
          <div class="logo-section">
            <div class="logo-icon">
              <ThunderboltOutlined />
            </div>
            <h1 class="logo-text">ProSub</h1>
          </div>
          <p class="welcome-text">欢迎回来，请登录您的账户</p>
        </div>

        <a-form
          :model="formData"
          :rules="rules"
          @finish="handleLogin"
          class="login-form"
          layout="vertical"
        >
          <a-form-item name="username" label="用户名">
            <a-input
              v-model:value="formData.username"
              size="large"
              placeholder="请输入用户名"
              class="form-input"
            >
              <template #prefix>
                <UserOutlined class="input-icon" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item name="password" label="密码">
            <a-input-password
              v-model:value="formData.password"
              size="large"
              placeholder="请输入密码"
              class="form-input"
            >
              <template #prefix>
                <LockOutlined class="input-icon" />
              </template>
            </a-input-password>
          </a-form-item>

          <div class="form-options">
            <a-checkbox v-model:checked="rememberMe">
              记住我
            </a-checkbox>
            <a class="forgot-link">忘记密码？</a>
          </div>

          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              :loading="loading"
              class="login-btn"
              block
            >
              {{ loading ? '登录中...' : '登录' }}
            </a-button>
          </a-form-item>
        </a-form>

        <div class="login-footer">
          <p class="footer-text">
            还没有账户？
            <a class="register-link">立即注册</a>
          </p>
        </div>
      </div>

      <!-- 右侧信息面板 -->
      <div class="info-panel">
        <div class="info-content">
          <h2 class="info-title">ProSub 管理系统</h2>
          <p class="info-description">
            专业的代理节点和订阅管理平台，为您提供高效、安全的网络代理服务管理解决方案。
          </p>
          
          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-icon">
                <ClusterOutlined />
              </div>
              <div class="feature-content">
                <h3>节点管理</h3>
                <p>轻松管理多个代理节点，实时监控状态</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <WifiOutlined />
              </div>
              <div class="feature-content">
                <h3>订阅管理</h3>
                <p>自动化订阅更新，支持多种协议格式</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <FileTextOutlined />
              </div>
              <div class="feature-content">
                <h3>配置生成</h3>
                <p>一键生成客户端配置文件，支持多种客户端</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Form, Input, Button, Checkbox, message } from 'ant-design-vue'
import {
  ThunderboltOutlined,
  UserOutlined,
  LockOutlined,
  ClusterOutlined,
  WifiOutlined,
  FileTextOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const loading = ref(false)
const rememberMe = ref(false)

const formData = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名至少3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ]
}

const handleLogin = async (values: any) => {
  loading.value = true
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: values.username,
        password: values.password,
        remember: rememberMe.value
      }),
    })

    if (response.ok) {
      message.success('登录成功')
      router.push('/')
    } else {
      const error = await response.json()
      message.error(error.message || '登录失败，请检查用户名和密码')
    }
  } catch (error) {
    console.error('Login error:', error)
    message.error('登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  position: relative;
  overflow: hidden;
}

.login-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1200px;
  width: 100%;
  background: var(--surface-color);
  border-radius: var(--radius-3xl);
  box-shadow: var(--shadow-2xl);
  overflow: hidden;
  position: relative;
  z-index: 2;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 50%;
  right: -75px;
  animation-delay: 2s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  bottom: -50px;
  left: 50%;
  animation-delay: 4s;
}

.decoration-line {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: slide 8s linear infinite;
}

.line-1 {
  width: 300px;
  height: 2px;
  top: 20%;
  left: -300px;
  animation-delay: 0s;
}

.line-2 {
  width: 200px;
  height: 1px;
  bottom: 30%;
  right: -200px;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

@keyframes slide {
  0% { transform: translateX(0); }
  100% { transform: translateX(600px); }
}

/* 登录卡片 */
.login-card {
  padding: var(--space-12);
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--surface-color);
  position: relative;
  z-index: 2;
}

.login-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.logo-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-size-xl);
}

.logo-text {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.welcome-text {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  margin: 0;
}

.login-form {
  margin-bottom: var(--space-6);
}

:deep(.ant-form-item-label > label) {
  color: var(--text-primary);
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.form-input {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
  background: var(--card-bg);
}

.form-input:focus,
.form-input:hover {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.1);
}

.input-icon {
  color: var(--text-tertiary);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

:deep(.ant-checkbox-wrapper) {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.forgot-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-fast);
}

.forgot-link:hover {
  color: var(--primary-dark);
}

.login-btn {
  height: 48px;
  border-radius: var(--radius-xl);
  font-weight: 600;
  font-size: var(--font-size-base);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border: none;
  box-shadow: 0 4px 12px rgba(0, 212, 170, 0.3);
  transition: all var(--transition-normal);
}

.login-btn:hover {
  background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 212, 170, 0.4);
}

.login-footer {
  text-align: center;
}

.footer-text {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

.register-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: color var(--transition-fast);
}

.register-link:hover {
  color: var(--primary-dark);
}

/* 信息面板 */
.info-panel {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  padding: var(--space-12);
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.info-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.info-content {
  position: relative;
  z-index: 2;
}

.info-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  margin-bottom: var(--space-4);
  line-height: 1.2;
}

.info-description {
  font-size: var(--font-size-lg);
  opacity: 0.9;
  margin-bottom: var(--space-8);
  line-height: 1.6;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  flex-shrink: 0;
}

.feature-content h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0 0 var(--space-2) 0;
}

.feature-content p {
  font-size: var(--font-size-sm);
  opacity: 0.8;
  margin: 0;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .login-container {
    grid-template-columns: 1fr;
    max-width: 500px;
  }
  
  .info-panel {
    display: none;
  }
  
  .login-card {
    padding: var(--space-8);
  }
}

@media (max-width: 768px) {
  .login-page {
    padding: var(--space-2);
  }
  
  .login-card {
    padding: var(--space-6);
  }
  
  .logo-text {
    font-size: var(--font-size-2xl);
  }
  
  .info-title {
    font-size: var(--font-size-2xl);
  }
}

/* 深色模式适配 */
.dark .login-card {
  background: var(--surface-color);
}

.dark .form-input {
  background: var(--card-bg);
  border-color: var(--border-color);
}

/* 动画效果 */
.login-card {
  animation: slideUp 0.6s var(--ease-out);
}

.info-panel {
  animation: slideIn 0.6s var(--ease-out) 0.2s both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>