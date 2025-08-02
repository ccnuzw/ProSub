<template>
  <ClientLayout />
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
import ClientLayout from './components/ClientLayout.vue'

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