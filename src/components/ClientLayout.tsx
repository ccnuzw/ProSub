// src/components/ClientLayout.tsx

'use client'

import React, { useState, useEffect } from 'react';
// *** 這是關鍵的修改 1: 導入 ConfigProvider 和 theme ***
import { Layout, Menu, Button, message, ConfigProvider, theme } from 'antd';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';
import DashboardLineIcon from 'remixicon-react/DashboardLineIcon';
import ServerLineIcon from 'remixicon-react/ServerLineIcon';
import WifiLineIcon from 'remixicon-react/WifiLineIcon';
import FileList2LineIcon from 'remixicon-react/FileList2LineIcon';
import GroupLineIcon from 'remixicon-react/GroupLineIcon';
import UserLineIcon from 'remixicon-react/UserLineIcon';
import LoginBoxLineIcon from 'remixicon-react/LoginBoxLineIcon';

const { Header, Content, Footer } = Layout;

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
        setLoadingUser(true); // 開始加載
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const user = await res.json() as User;
                setCurrentUser(user);
                if (user.name === 'admin' && user.defaultPasswordChanged === false && pathname !== '/user/change-password') {
                    message.warning('请修改默认密码');
                    router.push('/user/change-password');
                }
            } else {
                setCurrentUser(null);
                if (pathname !== '/user/login' && pathname !== '/user/register') {
                    router.push('/user/login');
                }
            }
        } catch (error) {
            console.error('Failed to fetch current user:', error);
            setCurrentUser(null);
        } finally {
            setLoadingUser(false); // 結束加載
        }
    };
    if (isClient) { // 確保只在客戶端執行
        fetchCurrentUser();
    }
  }, [router, pathname, isClient]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        message.success('登出成功');
        setCurrentUser(null);
        router.push('/user/login');
        router.refresh();
      } else {
        throw new Error('登出失败');
      }
    } catch (error) {
      console.error('Failed to logout:', error);
      message.error('登出失败，请重试');
    }
  };

const menuItems = [
    { key: 'dashboard', label: <Link href="/dashboard">仪表盘</Link>, icon: <DashboardLineIcon size={16} /> },
    { key: 'nodes', label: <Link href="/nodes">节点管理</Link>, icon: <ServerLineIcon size={16} /> },
    { key: 'subscriptions', label: <Link href="/subscriptions">订阅管理</Link>, icon: <WifiLineIcon size={16} /> },
    { key: 'profiles', label: <Link href="/profiles">配置文件</Link>, icon: <FileList2LineIcon size={16} /> },
];

if (isClient && currentUser) {
    menuItems.push({ key: 'user', label: <Link href="/user">用户管理</Link>, icon: <GroupLineIcon size={16} /> });
    menuItems.push({ key: 'profile', label: <Link href="/user/profile">我的资料</Link>, icon: <UserLineIcon size={16} /> });
} else if (isClient && !currentUser) {
    menuItems.push({ key: 'login', label: <Link href="/user/login">登录</Link>, icon: <LoginBoxLineIcon size={16} /> });
}

  const selectedKey = menuItems.find(item => pathname.startsWith(item.key === 'dashboard' ? '/dashboard' : `/${item.key}`))?.key || 'dashboard';
  
  // *** 這是關鍵的修改 2: 定義你的主題顏色 ***
  const customTheme = {
    token: {
      colorPrimary: '#00b96b', // 一個充滿活力的綠色作為主題色
      colorInfo: '#00b96b',
      borderRadius: 6, // 讓組件更圓潤
    },
    algorithm: theme.defaultAlgorithm, // 使用默認算法
  };

  return (
    // *** 這是關鍵的修改 3: 用 ConfigProvider 包裹所有內容 ***
    <ConfigProvider theme={customTheme}>
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ display: 'flex', alignItems: 'center', padding: '0 24px' }}>
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
            <Content style={{ padding: '24px 50px' }}>
                <div style={{ background: '#fff', padding: 24, borderRadius: customTheme.token.borderRadius }}>
                {children}
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
                ProSub ©{new Date().getFullYear()} Created with by Gemini
            </Footer>
        </Layout>
    </ConfigProvider>
  );
}