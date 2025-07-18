// src/components/ClientLayout.tsx

'use client'

import { Layout, Menu, Button, message } from 'antd'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { User } from '@/types'

const { Header, Content, Footer } = Layout

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const user = await res.json() as User
          setCurrentUser(user)
          if (user.name === 'admin' && user.defaultPasswordChanged === false && pathname !== '/user/change-password') {
            message.warning('请修改默认密码')
            router.push('/user/change-password')
          }
        } else {
          setCurrentUser(null)
          // 增加对注册页面的排除，防止重定向循环
          if (pathname !== '/user/login' && pathname !== '/user/register') {
            router.push('/user/login');
          }
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error)
        setCurrentUser(null)
      } finally {
        setLoadingUser(false)
      }
    }
    fetchCurrentUser()
  }, [router, pathname])

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        message.success('登出成功')
        setCurrentUser(null)
        router.push('/user/login')
      } else {
        throw new Error('登出失败')
      }
    } catch (error) {
      console.error('Failed to logout:', error)
      message.error('登出失败，请重试')
    }
  }

  const menuItems = [
    { key: 'dashboard', label: <Link href="/dashboard">仪表盘</Link> },
    { key: 'nodes', label: <Link href="/nodes">节点管理</Link> },
    { key: 'subscriptions', label: <Link href="/subscriptions">订阅管理</Link> },
    { key: 'profiles', label: <Link href="/profiles">配置文件</Link> },
  ]

  if (isClient && currentUser) {
    menuItems.push({ key: 'user', label: <Link href="/user">用户管理</Link> })
    menuItems.push({ key: 'profile', label: <Link href="/user/profile">我的资料</Link> })
  } else if (isClient && !currentUser) {
    menuItems.push({ key: 'login', label: <Link href="/user/login">登录</Link> })
  }

  const selectedKey = menuItems.find(item => pathname.startsWith(item.key === 'dashboard' ? '/dashboard' : `/${item.key}`))?.key || 'dashboard'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div className="logo" style={{ float: 'left', color: 'white', marginRight: '20px', fontSize: '1.5rem' }}>ProSub</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
        />
        <div style={{ float: 'right' }}>
          {isClient && !loadingUser && currentUser && (
            <Button type="primary" onClick={handleLogout}>
              登出 ({currentUser.name})
            </Button>
          )}
        </div>
      </Header>
      <Content style={{ padding: '0 50px', marginTop: '24px' }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
          {children}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        ProSub ©{new Date().getFullYear()} Created with by Gemini
      </Footer>
    </Layout>
  )
}