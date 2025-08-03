<template>
  <div class="client-layout">
    <!-- 顶部导航栏 -->
    <header class="top-nav">
      <div class="nav-container">
        <div class="nav-left">
          <div class="logo" @click="goHome" style="cursor: pointer;">
            <div class="logo-icon">
              <ThunderboltOutlined />
            </div>
            <span class="logo-text">ProSub</span>
          </div>
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
      <div class="content-container">
        <!-- PC端侧边导航 -->
        <aside class="sidebar" v-show="!isMobile">
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
              to="/user" 
              class="sidebar-nav-item"
              :class="{ active: $route.path.startsWith('/user') }"
            >
              <UserOutlined />
              <span>用户设置</span>
            </router-link>
          </nav>
        </aside>

        <!-- 主内容区域 -->
        <div class="main-content-area">
          <router-view />
        </div>
      </div>
    </main>

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
  FileTextOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const searchQuery = ref('')
const isDarkMode = ref(false)
const isMobile = ref(false)

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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--background-color);
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
  max-width: 1200px;
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
  color: var(--text-primary);
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
  padding: 24px 0;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  gap: 24px;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--surface-color);
  border-radius: var(--radius-lg);
  padding: 16px;
  height: fit-content;
  position: sticky;
  top: 88px;
  border: 1px solid var(--border-color);
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

.main-content-area {
  flex: 1;
  min-width: 0;
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
    padding-bottom: 80px;
  }
  
  .content-container {
    padding: 0 16px;
    flex-direction: column;
    gap: 16px;
  }
  
  .sidebar {
    width: 100%;
    position: static;
    order: 2;
  }
  
  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 8px;
  }
  
  .sidebar-nav-item {
    flex-shrink: 0;
    min-width: 120px;
    justify-content: center;
    text-align: center;
    flex-direction: column;
    gap: 4px;
    padding: 12px 8px;
  }
  
  .sidebar-nav-item span {
    font-size: 12px;
  }
  
  .main-content-area {
    order: 1;
  }
}
</style>