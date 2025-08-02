<template>
  <a-config-provider :theme="customTheme">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="logo flex-shrink-0 text-white text-lg sm:text-xl font-bold mr-4 sm:mr-6">ProSub</div>
        <a-menu
          theme="dark"
          mode="horizontal"
          :selected-keys="[selectedKey]"
          :items="menuItems"
          class="hidden sm:flex flex-1 min-w-0"
        />

        <a-button type="text" class="sm:hidden text-white" @click="toggleDrawer">
          <MenuOutlined />
        </a-button>

        <div class="ml-auto flex-shrink-0 flex items-center gap-2">
          <a-switch v-model:checked="isDarkTheme" @change="toggleTheme" class="mr-2">
            <template #checkedChildren><BulbOutlined /></template>
            <template #unCheckedChildren><BulbOutlined /></template>
          </a-switch>
          <span v-if="isClient && !loadingUser && currentUser" class="hidden sm:inline mr-2 text-white">
            {{ isDarkTheme ? '深色模式' : '浅色模式' }}
          </span>
          <a-button v-if="isClient && !loadingUser && currentUser" type="primary" @click="handleLogout">
            登出 ({{ currentUser.name }})
          </a-button>
          <a-button v-else-if="isClient && !loadingUser && !currentUser" type="primary" @click="router.push('/user/login')">
            登录
          </a-button>
        </div>
      </a-layout-header>

      <a-drawer
        v-model:open="drawerVisible"
        placement="left"
        :closable="true"
        @after-open-change="onDrawerChange"
        :width="200"
      >
        <a-menu
          mode="inline"
          :selected-keys="[selectedKey]"
          :items="menuItems"
          @click="toggleDrawer"
        />
      </a-drawer>

      <a-layout-content class="p-4 sm:p-6 lg:p-8">
        <div :style="{ padding: '16px', borderRadius: customTheme.token.borderRadius }" class="sm:p-6">
          <router-view />
        </div>
      </a-layout-content>
      
      <div class="mobile-nav sm:hidden">
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
      
      <a-layout-footer class="text-center p-4 hidden sm:block">
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
  MenuOutlined,
  BulbOutlined,
  LoginOutlined, // 确保 LoginOutlined 已导入
} from '@ant-design/icons-vue';

const { useToken } = theme;

const router = useRouter();
const route = useRoute();

const currentUser = ref<User | null>(null);
const loadingUser = ref(true);
const isClient = ref(false);
const drawerVisible = ref(false);

const isDarkTheme = ref(localStorage.getItem('theme') === 'dark');

const toggleDrawer = () => {
  drawerVisible.value = !drawerVisible.value;
};

const onDrawerChange = (val: boolean) => { 
  if (!val) drawerVisible.value = false;
};

const toggleTheme = (checked: boolean) => {
  isDarkTheme.value = checked;
  localStorage.setItem('theme', checked ? 'dark' : 'light');
};

onMounted(() => {
  isClient.value = true;
  // Set initial theme class on html element
  if (isDarkTheme.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});

// Watch for theme changes and update html class
watch(isDarkTheme, (newVal) => {
  if (newVal) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});

watch(isClient, (newVal) => {
  if (newVal) {
    fetchCurrentUser();
  }
});

watch(() => route.path, (newPath) => {
  if (isClient.value) {
    // 检查是否需要重新获取用户，例如在登录/登出后
    if (newPath === '/user/login' || newPath === '/dashboard') {
      fetchCurrentUser();
    }
  }
});

const fetchCurrentUser = async () => {
  loadingUser.value = true;
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const user = (await res.json()) as User;
      currentUser.value = user;
      if (user.name === 'admin' && user.defaultPasswordChanged === false && route.path !== '/user/change-password') {
        message.warning('请修改默认密码');
        router.push('/user/change-password');
      }
    } else {
      currentUser.value = null;
      if (route.path !== '/user/login' && route.path !== '/user/register') {
        router.push('/user/login');
      }
    }
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    currentUser.value = null;
  } finally {
    loadingUser.value = false;
  }
};

const handleLogout = async () => {
  try {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (res.ok) {
      message.success('登出成功');
      currentUser.value = null;
      router.push('/user/login');
    } else {
      throw new Error('登出失败');
    }
  } catch (error) {
    console.error('Failed to logout:', error);
    message.error('登出失败，请重试');
  }
};

const menuItems = computed(() => {
  const items = [
    { key: 'dashboard', label: '仪表盘', icon: DashboardOutlined, onClick: () => router.push('/dashboard') },
    { 
      key: 'nodes',
      label: '节点管理', 
      icon: ClusterOutlined,
      children: [
        { key: 'nodesList', label: '节点列表', onClick: () => router.push('/nodes') },
        { key: 'nodeGroups', label: '节点分组', onClick: () => router.push('/node-groups') }
      ]
    },
    { 
      key: 'subscriptions', 
      label: '订阅管理', 
      icon: WifiOutlined, 
      onClick: () => router.push('/subscriptions') 
    },
    { 
      key: 'profiles', 
      label: '配置文件', 
      icon: FileTextOutlined,
      children: [
        { key: 'profilesList', label: '配置列表', onClick: () => router.push('/profiles') },
        { key: 'ruleSets', label: '规则集', onClick: () => router.push('/rule-sets') }
      ]
    },
  ];

  if (isClient.value && currentUser.value) {
    items.push({ key: 'profile', label: '我的资料', icon: UserOutlined, onClick: () => router.push('/user/profile') });
  } else if (isClient.value && !currentUser.value) {
    items.push({ key: 'login', label: '登录', icon: LoginOutlined, onClick: () => router.push('/user/login') });
  }
  return items;
});

const selectedKey = computed(() => {
  const path = route.path;
  if (path.startsWith('/dashboard')) return 'dashboard';
  if (path.startsWith('/nodes')) return 'nodes';
  if (path.startsWith('/node-groups')) return 'nodeGroups';
  if (path.startsWith('/subscriptions')) return 'subscriptions';
  if (path.startsWith('/profiles')) return 'profiles';
  if (path.startsWith('/rule-sets')) return 'ruleSets';
  if (path.startsWith('/user/login')) return 'login';
  if (path.startsWith('/user/profile')) return 'profile';
  return 'dashboard';
});

const customTheme = computed(() => ({
  token: {
    colorPrimary: '#00b96b',
    colorInfo: '#00b96b',
    borderRadius: 6,
  },
  algorithm: isDarkTheme.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
}));
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>