// 前端认证工具函数
import { message } from 'ant-design-vue'

// 检查用户是否已登录
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('auth_token')
  return !!token
}

// 获取认证令牌
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token')
}

// 设置认证令牌
export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token)
}

// 清除认证信息
export function clearAuth(): void {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user_info')
}

// 保存用户信息
export function saveUserInfo(userInfo: any): void {
  localStorage.setItem('user_info', JSON.stringify(userInfo))
}

// 获取用户信息
export function getUserInfo(): any {
  const userInfo = localStorage.getItem('user_info')
  return userInfo ? JSON.parse(userInfo) : null
}

// 检查权限
export function hasPermission(permission: string): boolean {
  const userInfo = getUserInfo()
  if (!userInfo) return false
  
  // 管理员拥有所有权限
  if (userInfo.role === 'admin') return true
  
  // 这里可以添加更细粒度的权限检查
  return userInfo.permissions?.includes(permission) || false
}

// 显示认证错误
export function showAuthError(): void {
  message.error('请先登录')
}

// 显示权限错误
export function showPermissionError(): void {
  message.error('权限不足')
} 