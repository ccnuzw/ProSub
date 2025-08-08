<template>
  <div class="client-layout">
    <!-- PC端侧边导航 -->
    <aside class="sidebar" v-show="!isMobile" :class="{ 'collapsed': isSidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo" @click="goHome" style="cursor: pointer;">
          <div class="logo-icon">
            <ThunderboltOutlined />
          </div>
          <span class="logo-text" v-show="!isSidebarCollapsed">ProSub</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        <router-link 
          to="/" 
          class="sidebar-nav-item"
          :class="{ active: $route.path === '/' }"
        >
          <AppstoreOutlined />
          <span>仪表板</span>
        </router-link>
        
        <router-link 
          to="/nodes" 
          class="sidebar-nav-item"
          :class="{ active: $route.path.startsWith('/nodes') }"
        >
          <ClusterOutlined />
          <span>节点管理</span>
        </router-link>
        
        <router-link 
          to="/subscriptions" 
          class="sidebar-nav-item"
          :class="{ active: $route.path.startsWith('/subscriptions') }"
        >
          <WifiOutlined />
          <span>订阅管理</span>
        </router-link>
        
        <router-link 
          to="/profiles" 
          class="sidebar-nav-item"
          :class="{ active: $route.path.startsWith('/profiles') }"
        >
          <FileTextOutlined />
          <span>配置文件</span>
        </router-link>

        <router-link 
          to="/templates" 
          class="sidebar-nav-item"
          :class="{ active: $route.path.startsWith('/templates') }"
        >
          <ControlOutlined />
          <span>配置模板</span>
        </router-link>
        
        <router-link 
          to="/user" 
          class="sidebar-nav-item"
          :class="{ active: $route.path.startsWith('/user') }"
        >
          <UserOutlined />
          <span>用户设置</span>
        </router-link>
      </nav>
    </aside>

    <!-- 右侧内容区域 -->
    <div class="right-content-area">
      <!-- 顶部导航栏 -->
      <header class="top-nav">
        <div class="nav-container">
          <div class="nav-left">
            <!-- Collapse button here -->
            <a-button type="text" class="collapse-btn" @click="toggleSidebar">
              <template #icon>
                <MenuUnfoldOutlined v-if="isSidebarCollapsed" />
                <MenuFoldOutlined v-else />
              </template>
            </a-button>
            <!-- Original nav-left content (if any, currently empty) -->
          </div>

          <div class="nav-center">
            <div class="search-box">
              <SearchOutlined class="search-icon" />
              <input 
                type="text" 
                placeholder="搜索..." 
                class="search-input"
                v-model="searchQuery"
              />
            </div>
          </div>
          
          <div class="nav-right">
            <div class="nav-actions">
              <a-button 
                type="text" 
                class="action-btn"
                @click="toggleTheme"
              >
                <template #icon>
                  <BulbOutlined />
                </template>
              </a-button>
              
              <a-dropdown :trigger="['click']" placement="bottomRight">
                <a-button type="text" class="action-btn user-btn">
                  <template #icon>
                    <UserOutlined />
                  </template>
                  <span class="user-name">管理员</span>
                  <DownOutlined class="dropdown-arrow" />
                </a-button>
                <template #overlay>
                  <a-menu class="user-menu">
                    <a-menu-item key="profile" @click="goToProfile">
                      <UserOutlined />
                      <span>个人资料</span>
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="logout" @click="logout">
                      <LogoutOutlined />
                      <span>退出登录</span>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </div>
        </div>
      </header>

      <!-- 主要内容区域 -->
      <main class="main-content">
        <!-- 主内容区域 -->
        <div class="main-content-area">
          <router-view />
        </div>
      </main>
    </div>

    <!-- 移动端底部导航 -->
    <nav class="mobile-nav">
      <router-link 
        to="/" 
        class="mobile-nav-item"
        :class="{ active: $route.path === '/' }"
      >
        <AppstoreOutlined />
        <span>仪表板</span>
      </router-link>
      
      <router-link 
        to="/nodes" 
        class="mobile-nav-item"
        :class="{ active: $route.path.startsWith('/nodes') }"
      >
        <ClusterOutlined />
        <span>节点</span>
      </router-link>
      
      <router-link 
        to="/subscriptions" 
        class="mobile-nav-item"
        :class="{ active: $route.path.startsWith('/subscriptions') }"
      >
        <WifiOutlined />
        <span>订阅</span>
      </router-link>
      
      <router-link 
        to="/profiles" 
        class="mobile-nav-item"
        :class="{ active: $route.path.startsWith('/profiles') }"
      >
        <FileTextOutlined />
        <span>配置</span>
      </router-link>

      <router-link 
        to="/templates" 
        class="mobile-nav-item"
        :class="{ active: $route.path.startsWith('/templates') }"
      >
        <ControlOutlined />
        <span>模板</span>
      </router-link>
      
      <router-link 
        to="/user" 
        class="mobile-nav-item"
        :class="{ active: $route.path.startsWith('/user') }"
      >
        <UserOutlined />
        <span>用户</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ThunderboltOutlined,
  SearchOutlined,
  BulbOutlined,
  UserOutlined,
  DownOutlined,
  SettingOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  ClusterOutlined,
  WifiOutlined,
  FileTextOutlined,
  ControlOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const searchQuery = ref('')
const isDarkMode = ref(false)
const isMobile = ref(false)
const isSidebarCollapsed = ref(false) // New reactive property

// 检测移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 监听窗口大小变化
window.addEventListener('resize', checkMobile)

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark', isDarkMode.value)
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

const toggleSidebar = () => { // New method
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const goHome = () => {
  router.push('/')
}

const goToProfile = () => {
  router.push('/user')
}

const logout = async () => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST'
    })
    
    if (response.ok) {
      message.success('退出登录成功')
      router.push('/login')
    } else {
      message.error('退出登录失败')
    }
  } catch (error) {
    console.error('退出登录失败:', error)
    message.error('退出登录失败')
  }
}

onMounted(() => {
  // 初始化主题
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  }
  
  // 初始化移动端检测
  checkMobile()
})
</script>

<style scoped>
.client-layout {
  display: flex;
  flex-direction: row; /* Changed to row for side-by-side layout */
  background: var(--background-color);
  min-height: 100vh;
}

.right-content-area {
  display: flex;
  flex-direction: column;
  flex: 1; /* Takes remaining width */
}

.top-nav {
  background: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.nav-container {
  max-width: 100%; /* Adjust for full width within right-content-area */
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 8px; /* Add gap for collapse button and other elements */
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 18px;
  color: var(--text-primary);
}

.logo-icon {
  color: var(--primary-color);
  font-size: 20px;
}

.nav-center {
  flex: 1;
  max-width: 400px;
  margin: 0 24px;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  z-index: 1;
}

.search-input {
  width: 100%;
  height: 36px;
  padding: 8px 12px 8px 36px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-50);
}

.nav-right {
  display: flex;
  align-items: center;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.action-btn:hover {
  color: var(--primary-color);
  background: var(--border-light);
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 14px;
  color: var(--text-primary);
}

.dropdown-arrow {
  font-size: 12px;
  color: var(--text-tertiary);
}

.user-menu {
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto; /* Allow main content to scroll independently */
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--surface-color);
  border-radius: var(--radius-lg);
  padding: 16px;
  height: 100vh; /* Fill viewport height */
  border-right: 1px solid var(--border-color); /* Add right border */
  transition: width 0.3s ease; /* Add transition for smooth collapse */
  overflow-y: auto; /* Allow sidebar content to scroll */
  min-width: 80px; /* Ensure minimum width when collapsed */
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  min-height: 44px; /* Ensure consistent height */
}

.sidebar-nav-item:hover {
  color: var(--primary-color);
  background: var(--primary-50);
}

.sidebar-nav-item.active {
  color: var(--primary-color);
  background: var(--primary-50);
  border-left: 3px solid var(--primary-color);
}

.sidebar-nav-item .anticon {
  font-size: 16px;
}

/* Sidebar Header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 8px;
}

.sidebar.collapsed .sidebar-header .logo-text {
  display: none;
}

.sidebar.collapsed .logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}



.collapse-btn {
  font-size: 18px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-btn:hover {
  color: var(--primary-color);
}

/* Collapsed Sidebar */
.sidebar.collapsed {
  width: 80px; /* Collapsed width */
}

.sidebar.collapsed .sidebar-nav-item {
  justify-content: center;
  padding: 12px 0;
  gap: 0;
  min-height: 44px;
}

.sidebar.collapsed .sidebar-nav-item span {
  display: none;
}

.sidebar.collapsed .sidebar-nav-item .anticon {
  font-size: 20px;
  margin: 0;
}

/* Ensure icons are visible when sidebar is collapsed */
.sidebar.collapsed .sidebar-nav-item .anticon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 20px;
  min-height: 20px;
}



.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--surface-color);
  border-top: 1px solid var(--border-color);
  padding: 8px 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
}

.mobile-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 12px;
  transition: all 0.2s;
  border-radius: var(--radius-md);
  margin: 0 4px;
}

.mobile-nav-item:hover {
  color: var(--primary-color);
  background: var(--primary-50);
}

.mobile-nav-item.active {
  color: var(--primary-color);
  background: var(--primary-50);
}

.mobile-nav-item .anticon {
  font-size: 20px;
}

@media (max-width: 768px) {
  .client-layout {
    flex-direction: column; /* Stack top-nav and main-wrapper vertically */
  }

  .right-content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .sidebar {
    display: none; /* Hide sidebar on mobile */
  }

  .nav-container {
    padding: 0 16px;
  }
  
  .nav-center {
    display: none;
  }
  
  .mobile-nav {
    display: flex;
  }
  
  .main-content {
    padding: 16px;
  }
  
  .main-content-area {
    padding: 16px;
  }
}
</style>
