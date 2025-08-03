<template>
  <a-config-provider :theme="customTheme">
    <a-layout style="min-height: 100vh">
      <a-layout-sider
        v-if="!isMobile"
        v-model:collapsed="collapsed"
        :trigger="null"
        collapsible
        theme="dark"
        :style="{ background: 'var(--sider-bg)' }"
      >
        <div class="logo">ProSub</div>
        <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
          <a-menu-item key="dashboard" @click="goTo('/dashboard')">
            <DashboardOutlined />
            <span>仪表盘</span>
          </a-menu-item>
          <a-menu-item key="nodes" @click="goTo('/nodes')">
            <ClusterOutlined />
            <span>节点</span>
          </a-menu-item>
          <a-menu-item key="subscriptions" @click="goTo('/subscriptions')">
            <WifiOutlined />
            <span>订阅</span>
          </a-menu-item>
          <a-menu-item key="profiles" @click="goTo('/profiles')">
            <FileTextOutlined />
            <span>配置</span>
          </a-menu-item>
          <a-menu-item key="profile" @click="goTo('/user/profile')">
            <UserOutlined />
            <span>我的</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      
      <a-layout>
        <a-layout-header class="header">
          <div class="flex items-center">
            <MenuUnfoldOutlined
              v-if="collapsed && !isMobile"
              class="trigger"
              @click="() => (collapsed = !collapsed)"
            />
            <MenuFoldOutlined v-else-if="!isMobile" class="trigger" @click="() => (collapsed = !collapsed)" />
            <div v-if="isMobile" class="logo-mobile">ProSub</div>
          </div>
          
          <div class="flex-shrink-0 flex items-center gap-4">
            <a-switch v-model:checked="isDarkTheme" @change="toggleTheme">
              <template #checkedChildren><MoonOutlined /></template>
              <template #unCheckedChildren><SunOutlined /></template>
            </a-switch>
            <a-button v-if="currentUser" type="primary" @click="handleLogout">
              登出 ({{ currentUser.name }})
            </a-button>
            <a-button v-else type="primary" @click="goTo('/user/login')">
              登录
            </a-button>
          </div>
        </a-layout-header>
        
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>

        <div v-if="isMobile" class="mobile-nav">
          <router-link to="/dashboard" class="mobile-nav-item" :class="{ active: selectedKeys[0] === 'dashboard' }">
            <DashboardOutlined />
            <span>仪表盘</span>
          </router-link>
          <router-link to="/nodes" class="mobile-nav-item" :class="{ active: selectedKeys[0].startsWith('nodes') }">
            <ClusterOutlined />
            <span>节点</span>
          </router-link>
          <router-link to="/subscriptions" class="mobile-nav-item" :class="{ active: selectedKeys[0].startsWith('subscriptions') }">
            <WifiOutlined />
            <span>订阅</span>
          </router-link>
          <router-link to="/profiles" class="mobile-nav-item" :class="{ active: selectedKeys[0].startsWith('profiles') }">
            <FileTextOutlined />
            <span>配置</span>
          </router-link>
          <router-link to="/user/profile" class="mobile-nav-item" :class="{ active: selectedKeys[0] === 'profile' }">
            <UserOutlined />
            <span>我的</span>
          </router-link>
        </div>
      </a-layout>
    </a-layout>
  </a-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue';
import { Layout, Menu, Button, message, theme, Switch, ConfigProvider } from 'ant-design-vue';
import { useRouter, useRoute } from 'vue-router';
import { User } from '@shared/types';
import {
  DashboardOutlined, ClusterOutlined, WifiOutlined, FileTextOutlined, UserOutlined,
  MenuUnfoldOutlined, MenuFoldOutlined, SunOutlined, MoonOutlined
} from '@ant-design/icons-vue';

const router = useRouter();
const route = useRoute();
const currentUser = ref<User | null>(null);
const loadingUser = ref(true);
const isDarkTheme = ref(localStorage.getItem('theme') === 'dark');
const collapsed = ref(false);
const isMobile = ref(window.innerWidth < 768);

const handleResize = () => { isMobile.value = window.innerWidth < 768; };
onMounted(() => {
  window.addEventListener('resize', handleResize);
  document.documentElement.classList.toggle('dark', isDarkTheme.value);
  fetchCurrentUser();
});
onBeforeUnmount(() => window.removeEventListener('resize', handleResize));

const toggleTheme = (checked: boolean) => {
  isDarkTheme.value = checked;
  localStorage.setItem('theme', checked ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', checked);
};

const goTo = (path: string) => router.push(path);

watch(() => route.path, () => fetchCurrentUser(), { immediate: true });

const fetchCurrentUser = async () => {
  loadingUser.value = true;
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      currentUser.value = await res.json() as User;
      if (currentUser.value.name === 'admin' && !currentUser.value.defaultPasswordChanged && route.path !== '/user/change-password') {
        message.warning('请修改默认密码');
        router.push('/user/change-password');
      }
    } else {
      currentUser.value = null;
      if (route.meta.requiresAuth) router.push('/user/login');
    }
  } catch (error) {
    currentUser.value = null;
  } finally {
    loadingUser.value = false;
  }
};

const handleLogout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  message.success('登出成功');
  currentUser.value = null;
  router.push('/user/login');
};

const selectedKeys = computed({
  get() {
    const path = route.path;
    if (path.startsWith('/dashboard')) return ['dashboard'];
    if (path.startsWith('/nodes')) return ['nodes'];
    if (path.startsWith('/subscriptions')) return ['subscriptions'];
    if (path.startsWith('/profiles')) return ['profiles'];
    if (path.startsWith('/user/profile')) return ['profile'];
    return ['dashboard'];
  },
  set(keys) {
    // This setter is needed for v-model, but navigation is handled by @click
  }
});

const customTheme = computed(() => ({
  token: { colorPrimary: '#1677ff', borderRadius: 6 },
  algorithm: isDarkTheme.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
}));
</script>

<style scoped>
.logo {
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  border-radius: 6px;
}
.logo-mobile {
  color: white;
  font-weight: bold;
}
.header {
  background: var(--component-bg) !important;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}
.trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
  color: var(--text-color);
}
.trigger:hover {
  color: var(--ant-primary-color);
}
.content {
  margin: 24px 16px;
  padding: 24px;
  background: var(--component-bg);
  min-height: 280px;
}
</style>