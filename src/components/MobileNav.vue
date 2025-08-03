<template>
  <div class="mobile-nav">
    <div class="mobile-nav__header">
      <div class="mobile-nav__logo">
        <ThunderboltOutlined />
        <span>ProSub</span>
      </div>
      <a-button type="text" @click="$emit('toggle-menu')">
        <MenuOutlined />
      </a-button>
    </div>

    <div class="mobile-nav__content" v-if="isOpen">
      <div class="mobile-nav__user">
        <a-avatar :src="userAvatar" :size="48">
          <UserOutlined />
        </a-avatar>
        <div class="mobile-nav__user-info">
          <div class="mobile-nav__username">{{ username }}</div>
          <div class="mobile-nav__role">{{ userRole }}</div>
        </div>
      </div>

      <a-menu
        mode="inline"
        :selected-keys="[currentRoute]"
        class="mobile-nav__menu"
        @click="handleMenuClick"
      >
        <a-menu-item key="/dashboard">
          <template #icon>
            <DashboardOutlined />
          </template>
          仪表板
        </a-menu-item>
        
        <a-menu-item key="/nodes">
          <template #icon>
            <ClusterOutlined />
          </template>
          节点管理
        </a-menu-item>
        
        <a-menu-item key="/subscriptions">
          <template #icon>
            <FileTextOutlined />
          </template>
          订阅管理
        </a-menu-item>
        
        <a-menu-item key="/profiles">
          <template #icon>
            <ProfileOutlined />
          </template>
          配置文件
        </a-menu-item>
        
        <a-menu-item key="/user">
          <template #icon>
            <UserOutlined />
          </template>
          用户设置
        </a-menu-item>
      </a-menu>

      <div class="mobile-nav__footer">
        <a-button 
          type="text" 
          block 
          @click="handleLogout"
          class="mobile-nav__logout"
        >
          <LogoutOutlined />
          退出登录
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ThunderboltOutlined,
  MenuOutlined,
  UserOutlined,
  DashboardOutlined,
  ClusterOutlined,
  FileTextOutlined,
  ProfileOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue'
import { clearAuth } from '@/utils/auth'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'toggle-menu'): void
  (e: 'close-menu'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const router = useRouter()

const currentRoute = computed(() => router.currentRoute.value.path)
const username = computed(() => 'Admin') // 从用户状态获取
const userRole = computed(() => '管理员') // 从用户状态获取
const userAvatar = computed(() => '') // 从用户状态获取

const handleMenuClick = ({ key }: { key: string }) => {
  router.push(key)
  emit('close-menu')
}

const handleLogout = () => {
  clearAuth()
  message.success('已退出登录')
  router.push('/login')
  emit('close-menu')
}
</script>

<style scoped>
.mobile-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--color-bg-container);
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(10px);
}

.mobile-nav__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  height: 60px;
}

.mobile-nav__logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.mobile-nav__content {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-bg-container);
  border-top: 1px solid var(--color-border);
  overflow-y: auto;
  animation: slideDown 0.3s ease;
}

.mobile-nav__user {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.mobile-nav__user-info {
  flex: 1;
}

.mobile-nav__username {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
}

.mobile-nav__role {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.mobile-nav__menu {
  border: none;
  background: transparent;
}

.mobile-nav__menu :deep(.ant-menu-item) {
  height: 56px;
  line-height: 56px;
  margin: 0;
  border-radius: 0;
}

.mobile-nav__menu :deep(.ant-menu-item-selected) {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.mobile-nav__footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  margin-top: auto;
}

.mobile-nav__logout {
  color: var(--color-error);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  height: 44px;
}

.mobile-nav__logout:hover {
  background: var(--color-error-bg);
  color: var(--color-error);
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (min-width: 768px) {
  .mobile-nav {
    display: none;
  }
}
</style> 