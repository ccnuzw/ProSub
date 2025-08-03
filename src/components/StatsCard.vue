<template>
  <div class="stats-card" :class="`stats-card--${type}`">
    <div class="stats-card__icon">
      <component :is="icon" />
    </div>
    <div class="stats-card__content">
      <div class="stats-card__value">{{ formatValue(value) }}</div>
      <div class="stats-card__label">{{ label }}</div>
      <div class="stats-card__trend" v-if="trend">
        <component :is="trendIcon" />
        <span :class="getTrendClass()">{{ formatTrend(trend) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  UserOutlined,
  ClusterOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined
} from '@ant-design/icons-vue'
import { formatNumber, formatPercent } from '@/utils/format'

interface Props {
  type: 'primary' | 'success' | 'warning' | 'error' | 'info'
  label: string
  value: number | string
  icon?: string
  trend?: number
  format?: 'number' | 'percent' | 'currency' | 'custom'
}

const props = withDefaults(defineProps<Props>(), {
  format: 'number'
})

const icon = computed(() => {
  if (props.icon) {
    return props.icon
  }
  
  switch (props.type) {
    case 'primary':
      return UserOutlined
    case 'success':
      return CheckCircleOutlined
    case 'warning':
      return ThunderboltOutlined
    case 'error':
      return CloseCircleOutlined
    case 'info':
      return FileTextOutlined
    default:
      return ClusterOutlined
  }
})

const trendIcon = computed(() => {
  if (!props.trend) return MinusOutlined
  
  if (props.trend > 0) {
    return ArrowUpOutlined
  } else if (props.trend < 0) {
    return ArrowDownOutlined
  } else {
    return MinusOutlined
  }
})

const formatValue = (value: number | string) => {
  if (typeof value === 'string') return value
  
  switch (props.format) {
    case 'number':
      return formatNumber(value)
    case 'percent':
      return formatPercent(value, 100)
    case 'currency':
      return `$${formatNumber(value)}`
    case 'custom':
      return value.toString()
    default:
      return formatNumber(value)
  }
}

const formatTrend = (trend: number) => {
  const absTrend = Math.abs(trend)
  return `${trend > 0 ? '+' : ''}${formatNumber(absTrend)}%`
}

const getTrendClass = () => {
  if (!props.trend) return 'trend-neutral'
  
  if (props.trend > 0) {
    return 'trend-up'
  } else if (props.trend < 0) {
    return 'trend-down'
  } else {
    return 'trend-neutral'
  }
}
</script>

<style scoped>
.stats-card {
  background: var(--color-bg-container);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: all 0.2s ease;
}

.stats-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.stats-card--primary {
  border-left: 4px solid var(--color-primary);
}

.stats-card--success {
  border-left: 4px solid var(--color-success);
}

.stats-card--warning {
  border-left: 4px solid var(--color-warning);
}

.stats-card--error {
  border-left: 4px solid var(--color-error);
}

.stats-card--info {
  border-left: 4px solid var(--color-info);
}

.stats-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--color-fill-tertiary);
  color: var(--color-primary);
  font-size: 24px;
}

.stats-card--primary .stats-card__icon {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.stats-card--success .stats-card__icon {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.stats-card--warning .stats-card__icon {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.stats-card--error .stats-card__icon {
  background: var(--color-error-bg);
  color: var(--color-error);
}

.stats-card--info .stats-card__icon {
  background: var(--color-info-bg);
  color: var(--color-info);
}

.stats-card__content {
  flex: 1;
  min-width: 0;
}

.stats-card__value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  line-height: 1.2;
  margin-bottom: var(--spacing-xs);
}

.stats-card__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.stats-card__trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
}

.trend-up {
  color: var(--color-success);
}

.trend-down {
  color: var(--color-error);
}

.trend-neutral {
  color: var(--color-text-tertiary);
}

@media (max-width: 768px) {
  .stats-card {
    padding: var(--spacing-md);
  }
  
  .stats-card__icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
  
  .stats-card__value {
    font-size: var(--font-size-xl);
  }
}
</style> 