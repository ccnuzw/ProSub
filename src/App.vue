<template>
  <router-view />
  <div v-if="showInstallPrompt" class="pwa-install-prompt" :class="{ dark: isDarkMode }">
    <img src="./assets/logo-192.svg" alt="ProSub" class="logo" />
    <div class="content">
      <div class="font-bold">安装 ProSub 应用</div>
      <div class="text-sm mt-1">将 ProSub 安装到主屏幕以获得更好的体验</div>
    </div>
    <div class="actions">
      <button class="install-btn" @click="installPWA">安装</button>
      <button class="cancel-btn" @click="dismissInstallPrompt">取消</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount } from 'vue'

const showInstallPrompt = ref(false)
const isDarkMode = ref(false)
let deferredPrompt: any = null

onBeforeMount(() => {
  // 检查深色模式偏好
  isDarkMode.value = localStorage.getItem('theme') === 'dark' || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
})

onMounted(() => {
  // 监听PWA安装事件
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    showInstallPrompt.value = true
  })

  // 监听主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      isDarkMode.value = e.matches
    }
  })
})

const installPWA = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }
      deferredPrompt = null
      showInstallPrompt.value = false
    })
  }
}

const dismissInstallPrompt = () => {
  showInstallPrompt.value = false
  // 可以选择保存用户的选择，避免频繁提示
  localStorage.setItem('pwaInstallPromptDismissed', 'true')
}
</script>

<style scoped>
</style>

<style>
/* 全局样式或特定的底部导航栏样式 /
.mobile-nav {
position: fixed;
bottom: 0;
left: 0;
width: 100%;
background-color: white;
border-top: 1px solid #f0f0f0;
display: flex;
justify-content: space-around;
padding: 8px 0;
z-index: 100; / 确保它在内容之上 */
}

.dark .mobile-nav {
background-color: #1f1f1f;
border-top-color: #333;
}

.mobile-nav-item {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
color: #999;
text-decoration: none;
font-size: 12px;
}

.dark .mobile-nav-item {
color: #ccc;
}

.mobile-nav-item.active {
color: #00b96b;
}

.dark .mobile-nav-item.active {
color: #00d68f;
}

.mobile-nav-item .anticon {
font-size: 16px;
margin-bottom: 2px;
}

/* 调整 layout-content 的底部内边距 /
.ant-layout-content {
padding-bottom: 50px; / 根据底部导航栏的高度调整 */
}

.dark .ant-layout-content {
/* 如果需要为深色模式下的 content 添加额外样式 */
}

/* 隐藏 layout-footer */
.ant-layout-footer {
display: none !important;
}
</style>