// 前端格式化工具函数

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化时间
export function formatTime(date: Date | string | number): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚'
  }
  
  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 1000)) + '分钟前'
  }
  
  // 小于24小时
  if (diff < 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 60 * 1000)) + '小时前'
  }
  
  // 小于30天
  if (diff < 30 * 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (24 * 60 * 60 * 1000)) + '天前'
  }
  
  // 超过30天显示具体日期
  return d.toLocaleDateString('zh-CN')
}

// 格式化日期时间
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 格式化日期
export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 格式化数字
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 格式化百分比
export function formatPercent(value: number, total: number): string {
  if (total === 0) return '0%'
  return Math.round((value / total) * 100) + '%'
}

// 格式化节点状态
export function formatNodeStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'online': '在线',
    'offline': '离线',
    'unknown': '未知',
    'checking': '检查中'
  }
  return statusMap[status] || status
}

// 格式化节点类型
export function formatNodeType(type: string): string {
  const typeMap: Record<string, string> = {
    'ss': 'Shadowsocks',
    'ssr': 'ShadowsocksR',
    'vmess': 'VMess',
    'vless': 'VLESS',
    'trojan': 'Trojan',
    'socks5': 'SOCKS5',
    'hysteria': 'Hysteria',
    'hysteria2': 'Hysteria2',
    'tuic': 'TUIC',
    'vless-reality': 'VLESS Reality'
  }
  return typeMap[type] || type
}

// 格式化客户端类型
export function formatClientType(type: string): string {
  const typeMap: Record<string, string> = {
    'clash': 'Clash',
    'surge': 'Surge',
    'quantumult-x': 'Quantumult X',
    'loon': 'Loon',
    'sing-box': 'Sing Box'
  }
  return typeMap[type] || type
}

// 截断文本
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 格式化JSON
export function formatJSON(obj: any, indent: number = 2): string {
  try {
    return JSON.stringify(obj, null, indent)
  } catch (error) {
    return String(obj)
  }
} 