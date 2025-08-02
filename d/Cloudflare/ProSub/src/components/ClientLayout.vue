<template>
  <a-config-provider :theme="customTheme">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="logo flex-shrink-0 text-white text-lg sm:text-xl font-bold mr-4 sm:mr-6">ProSub</div>
        <!-- Desktop Menu -->
        <a-menu
          theme="dark"
          mode="horizontal"
          :selected-keys="[selectedKey]"
          :items="menuItems"
          class="hidden sm:flex flex-1 min-w-0"
        />

        <!-- Mobile Menu Button -->
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

      <!-- Mobile Drawer -->
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
      
      <!-- Mobile Bottom Navigation -->
      <div class="mobile-nav sm:hidden">
        <a href="/#/dashboard" class="mobile-nav-item" :class="{ active: selectedKey === 'dashboard' }">
          <DashboardOutlined />
          <span>仪表盘</span>
        </a>
        <a href="/#/nodes" class="mobile-nav-item" :class="{ active: selectedKey.startsWith('nodes') }">
          <ClusterOutlined />
          <span>节点</span>
        </a>
        <a href="/#/subscriptions" class="mobile-nav-item" :class="{ active: selectedKey.startsWith('subscriptions') }">
          <WifiOutlined />
          <span>订阅</span>
        </a>
      </div>
    </a-layout>
  </a-config-provider>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const menuItems = [
  { key: 'dashboard', label: '仪表盘', path: '/dashboard' },
  { key: 'nodes', label: '节点', path: '/nodes' },
  { key: 'subscriptions', label: '订阅', path: '/subscriptions' },
  { key: 'profiles', label: '配置文件', path: '/profiles' },
  { key: 'rule-sets', label: '规则集', path: '/rule-sets' },
  { key: 'user/profile', label: '我的', path: '/user/profile' }
]

const selectedKey = computed(() => route.path.split('/').pop() || '')

</script>