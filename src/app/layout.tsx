// src/app/layout.tsx

import './globals.css'
import AntdRegistry from '@/components/AntdRegistry'
import ClientLayout from '@/components/ClientLayout' // 导入新的客户端组件
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ProSub - 节点订阅管理',
  description: '轻量级机场订阅和自建节点管理分享项目',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <ClientLayout>{children}</ClientLayout>
        </AntdRegistry>
      </body>
    </html>
  )
}