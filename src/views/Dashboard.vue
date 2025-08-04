<template>
  <div class="dashboard">
    <!-- 欢迎卡片 -->
    <div class="welcome-section">
      <div class="welcome-card">
        <div class="welcome-content">
          <div class="welcome-text">
            <h1 class="welcome-title">欢迎回来</h1>
            <p class="welcome-subtitle">ProSub 管理系统为您提供全面的节点和订阅管理</p>
          </div>
          <div class="welcome-actions">
            <a-button 
              type="primary" 
              size="large"
              @click="refreshData" 
              :loading="loading"
            >
              <template #icon>
                <RedoOutlined />
              </template>
              刷新数据
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-section">
      <a-card class="stats-card" :bordered="false">
        <template #title>
          <div class="card-title">
            <AppstoreOutlined class="title-icon" />
            <span>统计概览</span>
          </div>
        </template>
        <a-row :gutter="24">
          <a-col :span="6">
            <div class="stat-item">
              <div class="stat-icon">
                <ClusterOutlined />
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.nodes }}</div>
                <div class="stat-label">总节点数</div>
                <div class="stat-subtitle">{{ stats.onlineNodes }} 个在线</div>
              </div>
            </div>
          </a-col>
          <a-col :span="6">
            <div class="stat-item">
              <div class="stat-icon">
                <FileTextOutlined />
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.subscriptions }}</div>
                <div class="stat-label">订阅数量</div>
                <div class="stat-subtitle">有效订阅</div>
              </div>
            </div>
          </a-col>
          <a-col :span="6">
            <div class="stat-item">
              <div class="stat-icon">
                <ProfileOutlined />
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.profiles }}</div>
                <div class="stat-label">配置文件</div>
                <div class="stat-subtitle">已创建</div>
              </div>
            </div>
          </a-col>
          <a-col :span="6">
            <div class="stat-item">
              <div class="stat-icon">
                <WifiOutlined />
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.nodes > 0 ? Math.round((stats.onlineNodes / stats.nodes) * 100) : 0 }}%</div>
                <div class="stat-label">在线率</div>
                <div class="stat-subtitle">节点可用性</div>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  RedoOutlined,
  AppstoreOutlined,
  ClusterOutlined,
  FileTextOutlined,
  ProfileOutlined,
  WifiOutlined
} from '@ant-design/icons-vue'

interface Stats {
  nodes: number
  onlineNodes: number
  subscriptions: number
  profiles: number
}

const loading = ref(false)
const stats = ref<Stats>({
  nodes: 0,
  onlineNodes: 0,
  subscriptions: 0,
  profiles: 0
})

const fetchStats = async () => {
  try {
    const [nodesRes, subscriptionsRes, profilesRes] = await Promise.all([
      fetch('/api/nodes'),
      fetch('/api/subscriptions'),
      fetch('/api/profiles')
    ])
    
    if (nodesRes.ok) {
      const nodes = await nodesRes.json()
      stats.value.nodes = nodes.length
      stats.value.onlineNodes = Math.floor(nodes.length * 0.8) // 模拟在线节点
    }
    
    if (subscriptionsRes.ok) {
      const subscriptions = await subscriptionsRes.json()
      stats.value.subscriptions = subscriptions.length
    }
    
    if (profilesRes.ok) {
      const profiles = await profilesRes.json()
      stats.value.profiles = profiles.length
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    message.error('获取统计数据失败')
  }
}

const refreshData = async () => {
  loading.value = true
  try {
    await fetchStats()
    message.success('数据刷新成功')
  } catch (error) {
    console.error('刷新数据失败:', error)
    message.error('刷新数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.welcome-section {
  margin-bottom: 24px;
}

.welcome-card {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border-radius: 16px;
  padding: 32px;
  color: white;
  position: relative;
  overflow: hidden;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.welcome-subtitle {
  font-size: 16px;
  opacity: 0.9;
}

.stats-section {
  margin-bottom: 24px;
}

.stats-card {
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

.title-icon {
  color: var(--primary-color);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--primary-50);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.stat-subtitle {
  font-size: 12px;
  color: var(--text-tertiary);
}

@media (max-width: 768px) {
  .dashboard {
    gap: 16px;
  }
  
  .welcome-card {
    padding: 24px;
  }
  
  .welcome-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .welcome-title {
    font-size: 24px;
  }
  
  .stat-item {
    padding: 16px;
  }
}
</style>