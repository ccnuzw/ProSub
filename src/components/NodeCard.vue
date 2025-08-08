<template>
  <div class="node-card" :class="{ 'node-card--selected': isSelected }">
    <div class="node-card__header">
      <div class="node-card__title">
        <h3 class="node-card__name">{{ node.name }}</h3>
        <span class="node-card__type">{{ formatNodeType(node.type) }}</span>
      </div>
      <div class="node-card__actions">
        <a-checkbox 
          :checked="isSelected" 
          @change="handleSelect"
          class="node-card__checkbox"
        />
        <a-dropdown :trigger="['click']">
          <a-button type="text" size="small">
            <template #icon>
              <MoreOutlined />
            </template>
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item key="edit" @click="handleEdit">
                <EditOutlined />
                编辑
              </a-menu-item>
              <a-menu-item key="copy" @click="handleCopy">
                <CopyOutlined />
                复制链接
              </a-menu-item>
              <a-menu-item key="test" @click="handleTest">
                <SyncOutlined />
                测试连接
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item key="delete" @click="handleDelete" danger>
                <DeleteOutlined />
                删除
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>

    <div class="node-card__content">
      <div class="node-card__info">
        <div class="node-card__server">
          <ServerOutlined />
          <span>{{ node.server }}:{{ node.port }}</span>
        </div>
        
        <div class="node-card__status" v-if="nodeStatus">
          <div class="node-card__status-indicator" :class="getStatusClass(nodeStatus.status)">
            <span class="node-card__status-dot"></span>
            <span class="node-card__status-text">{{ formatNodeStatus(nodeStatus.status) }}</span>
          </div>
          <div class="node-card__latency" v-if="nodeStatus.latency">
            {{ nodeStatus.latency }}ms
          </div>
        </div>
      </div>

      <div class="node-card__tags" v-if="node.params">
        <a-tag v-if="node.params.method" size="small">{{ node.params.method }}</a-tag>
        <a-tag v-if="node.params.protocol" size="small">{{ node.params.protocol }}</a-tag>
        <a-tag v-if="node.params.obfs" size="small">{{ node.params.obfs }}</a-tag>
        <a-tag v-if="node.params.tls" size="small" color="green">TLS</a-tag>
        <a-tag v-if="node.params.udpRelay" size="small" color="blue">UDP</a-tag>
      </div>
    </div>

    <div class="node-card__footer" v-if="showFooter">
      <div class="node-card__meta">
        <span class="node-card__created">{{ formatTime(node.createdAt || new Date()) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { message } from 'ant-design-vue'
import { 
  MoreOutlined, 
  EditOutlined, 
  CopyOutlined, 
  SyncOutlined, 
  DeleteOutlined,
  ServerOutlined 
} from '@ant-design/icons-vue'
import type { Node, HealthStatus } from '@shared/types'
import { formatNodeType, formatNodeStatus, formatTime } from '@/utils/format'

interface Props {
  node: Node
  isSelected?: boolean
  nodeStatus?: HealthStatus
  showFooter?: boolean
}

interface Emits {
  (e: 'select', nodeId: string, selected: boolean): void
  (e: 'edit', node: Node): void
  (e: 'delete', nodeId: string): void
  (e: 'test', nodeId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  showFooter: true
})

const emit = defineEmits<Emits>()

const handleSelect = (e: any) => {
  emit('select', props.node.id, e.target.checked)
}

const handleEdit = () => {
  emit('edit', props.node)
}

const handleDelete = () => {
  emit('delete', props.node.id)
}

const handleTest = () => {
  emit('test', props.node.id)
}

const handleCopy = async () => {
  try {
    // 生成节点链接
    const nodeLink = generateNodeLink(props.node)
    await navigator.clipboard.writeText(nodeLink)
    message.success('节点链接已复制到剪贴板')
  } catch (error) {
    message.error('复制失败')
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'online':
      return 'status-online'
    case 'offline':
      return 'status-offline'
    case 'checking':
      return 'status-checking'
    default:
      return 'status-unknown'
  }
}

const generateNodeLink = (node: Node): string => {
  // 根据节点类型生成对应的链接格式
  switch (node.type) {
    case 'vmess':
      return `vmess://${btoa(JSON.stringify({
        v: '2',
        ps: node.name,
        add: node.server,
        port: node.port,
        id: node.password,
        aid: node.params?.alterId || 0,
        net: node.params?.network || 'tcp',
        type: node.params?.type || 'none',
        host: node.params?.host || '',
        path: node.params?.wsPath || '',
        tls: node.params?.tls ? 'tls' : 'none'
      }))}`
    
    case 'vless':
      return `vless://${node.password}@${node.server}:${node.port}?type=${node.params?.network || 'tcp'}&security=${node.params?.tls ? 'tls' : 'none'}#${encodeURIComponent(node.name)}`
    
    case 'ss':
      return `ss://${btoa(`${node.params?.method || 'aes-256-gcm'}:${node.password}@${node.server}:${node.port}`)}#${encodeURIComponent(node.name)}`
    
    case 'trojan':
      return `trojan://${node.password}@${node.server}:${node.port}?security=${node.params?.tls ? 'tls' : 'none'}#${encodeURIComponent(node.name)}`
    
    default:
      return `${node.type}://${node.server}:${node.port}`
  }
}
</script>

<style scoped>
.node-card {
  background: var(--color-bg-container);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  transition: all 0.2s ease;
  cursor: pointer;
}

.dark .node-card {
  background: #1c1c1e;
  border-color: var(--color-border);
}

.node-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.node-card--selected {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
}

.node-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.node-card__title {
  flex: 1;
  min-width: 0;
}

.node-card__name {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .node-card__name {
  color: var(--color-text);
}

.node-card__type {
  display: inline-block;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  background: var(--color-fill-tertiary);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  margin-top: var(--spacing-xs);
}

.dark .node-card__type {
  color: var(--color-text-secondary);
  background: rgba(152, 152, 159, 0.1);
}

.node-card__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.node-card__checkbox {
  margin-right: var(--spacing-xs);
}

.node-card__content {
  margin-bottom: var(--spacing-sm);
}

.node-card__info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.node-card__server {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-family: var(--font-family-mono);
}

.dark .node-card__server {
  color: var(--color-text-secondary);
}

.node-card__status {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.node-card__status-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.node-card__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-text-tertiary);
}

.status-online .node-card__status-dot {
  background: var(--color-success);
}

.status-offline .node-card__status-dot {
  background: var(--color-error);
}

.status-checking .node-card__status-dot {
  background: var(--color-warning);
  animation: pulse 1.5s infinite;
}

.node-card__status-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.dark .node-card__status-text {
  color: var(--color-text-secondary);
}

.node-card__latency {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  font-family: var(--font-family-mono);
}

.dark .node-card__latency {
  color: var(--color-text-tertiary);
}

.node-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.node-card__footer {
  border-top: 1px solid var(--color-border);
  padding-top: var(--spacing-sm);
}

.node-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.node-card__created {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.dark .node-card__created {
  color: var(--color-text-tertiary);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (max-width: 768px) {
  .node-card {
    padding: var(--spacing-sm);
  }
  
  .node-card__header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .node-card__actions {
    align-self: flex-end;
  }
  
  .node-card__info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
}
</style> 