<template>
  <a-config-provider :theme="customTheme">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        
        <div class="flex items-center flex-1 min-w-0">
          <div class="logo flex-shrink-0 text-white text-lg sm:text-xl font-bold">ProSub</div>
        </div>

        <div class="flex-shrink-0 flex items-center gap-2">
          <a-switch v-model:checked="isDarkTheme" @change="toggleTheme" class="mr-2">
            <template #checkedChildren><BulbOutlined /></template>
            <template #unCheckedChildren><BulbOutlined /></template>
          </a-switch>
          <a-button v-if="isClient && !loadingUser && currentUser" type="primary" @click="handleLogout">
            登出 ({{ currentUser.name }})
          </a-button>
          <a-button v-else-if="isClient && !loadingUser && !currentUser" type="primary" @click="router.push('/user/login')">
            登录
          </a-button>
        </div>

      </a-layout-header>

      <a-layout-content class="p-4 sm:p-6 lg:p-8">
        <div :style="{ padding: '16px', borderRadius: customTheme.token.borderRadius }" class="sm:p-6">
          <router-view />
        </div>
      </a-layout-content>
      
      <div class="mobile-nav">
        <router-link to="/dashboard" class="mobile-nav-item" :class="{ active: selectedKey === 'dashboard' }">
          <DashboardOutlined />
          <span>仪表盘</span>
        </router-link>
        <router-link to="/nodes" class="mobile-nav-item" :class="{ active: selectedKey.startsWith('nodes') }">
          <ClusterOutlined />
          <span>节点</span>
        </router-link>
        <router-link to="/subscriptions" class="mobile-nav-item" :class="{ active: selectedKey.startsWith('subscriptions') }">
          <WifiOutlined />
          <span>订阅</span>
        </router-link>
        <router-link to="/profiles" class="mobile-nav-item" :class="{ active: selectedKey.startsWith('profiles') }">
          <FileTextOutlined />
          <span>配置</span>
        </router-link>
        <router-link to="/user/profile" class="mobile-nav-item" :class="{ active: selectedKey === 'profile' }">
          <UserOutlined />
          <span>我的</span>
        </router-link>
      </div>
      
      <a-layout-footer class="text-center p-4">
        ProSub ©{{ new Date().getFullYear() }} Created with by Gemini
      </a-layout-footer>
    </a-layout>
  </a-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { Layout, Menu, Button, message, theme, Drawer, Switch, ConfigProvider } from 'ant-design-vue';
import { useRouter, useRoute } from 'vue-router';
import { User } from '@shared/types';
import {
  DashboardOutlined,
  ClusterOutlined,
  WifiOutlined,
  FileTextOutlined,
  UserOutlined,
  BulbOutlined,
  LoginOutlined,
} from '@ant-design/icons-vue';

const { useToken } = theme;
const router = useRouter();
const route = useRoute();
const currentUser = ref<User | null>(null);
const loadingUser = ref(true);
const isClient = ref(false);
const isDarkTheme = ref(localStorage.getItem('theme') === 'dark');

const toggleTheme = (checked: boolean) => {
  isDarkTheme.value = checked;
  localStorage.setItem('theme', checked ? 'dark' : 'light');
};

onMounted(() => {
  isClient.value = true;
  if (isDarkTheme.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});

watch(isDarkTheme, (newVal) => {
  if (newVal) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});

watch(isClient, (newVal) => {
  if (newVal) fetchCurrentUser();
});

watch(() => route.path, (newPath) => {
  if (isClient.value && (newPath === '/user/login' || newPath === '/dashboard')) {
    fetchCurrentUser();
  }
});

const fetchCurrentUser = async () => {
  loadingUser.value = true;
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      currentUser.value = (await res.json()) as User;
      if (currentUser.value.name === 'admin' && !currentUser.value.defaultPasswordChanged && route.path !== '/user/change-password') {
        message.warning('请修改默认密码');
        router.push('/user/change-password');
      }
    } else {
      currentUser.value = null;
      if (route.meta.requiresAuth) {
        router.push('/user/login');
      }
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

// menuItems is no longer needed for the <a-menu> but might be used by the drawer if you keep it.
// For this change, we can simplify or remove it if the drawer is also removed.
const menuItems = computed(() => {
  // This is now only for the mobile drawer, which we've removed.
  // You can keep it if you plan to use it elsewhere, otherwise it can be removed.
  return []; 
});


const selectedKey = computed(() => {
  const path = route.path;
  if (path.startsWith('/dashboard')) return 'dashboard';
  if (path.startsWith('/nodes')) return 'nodes';
  if (path.startsWith('/subscriptions')) return 'subscriptions';
  if (path.startsWith('/profiles')) return 'profiles';
  if (path.startsWith('/user/profile')) return 'profile';
  return 'dashboard';
});

const customTheme = computed(() => ({
  token: { colorPrimary: '#00b96b', borderRadius: 6 },
  algorithm: isDarkTheme.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
}));
</script>

<style scoped>
/* Scoped styles can be added here if needed */
</style>